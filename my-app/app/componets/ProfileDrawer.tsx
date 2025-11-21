// src/components/ProfileDrawer.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Animated,
  Easing,
  Switch,
  Alert,
} from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import EditProfileModal, { ProfileData } from "./EditProfileModal";
import { useAuth } from "@/context/auth.context";
import { useRouter } from "expo-router";

export const ProfileDrawer = ({
  visible,
  onClose,
  onLogout,
  viewedProfile,
  onViewSaved,
}: {
  visible: boolean;
  onClose: () => void;
  onLogout?: () => void;
  viewedProfile?: ProfileData | null; // se passar, mostra esse perfil em modo visualização
  onViewSaved?: () => void; // callback quando o usuário clicar em "Ver salvos"
}) => {
  const [animation] = useState(new Animated.Value(0));
  const { user, signOut } = useAuth();
  const router = useRouter();

  // internal modals
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  // profile data (local) -> será usado quando estiver visualizando o "próprio" perfil
  const [profile, setProfile] = useState<ProfileData>({
    name: user?.username || "",
    email: user?.email || "",
    phone: user?.telefone || "",
    address: {},
    avatar: "https://placekitten.com/200/200",
  });

  // settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [language, setLanguage] = useState<"pt" | "en">("pt");

  useEffect(() => {
    Animated.timing(animation, {
      toValue: visible ? 1 : 0,
      duration: 300,
      easing: visible ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 0],
  });

  // handlers
  const handleOpenSettings = () => setShowSettings(true);
  const handleOpenEdit = () => setShowEditProfile(true);
  const handleRequestLogout = () => setShowLogoutConfirm(true);

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onClose();
    if (onLogout) onLogout();
    signOut();
    router.replace("/");
  };

  const handleSaveProfile = (updated: ProfileData) => {
    setProfile(updated);
    setShowEditProfile(false);
  };

  const handleSaveSettings = () => {
    // persist settings if needed
    setShowSettings(false);
  };

  const handleViewSaved = () => {
    // Fecha o drawer e chama callback (se informado)
    onClose();
    if (onViewSaved) {
      try {
        onViewSaved();
      } catch (e) {
        console.warn("Erro ao chamar onViewSaved:", e);
      }
    } else {
      Alert.alert("Salvos", "Abrir salvos (callback não configurado).");
    }
  };

  // language button helper
  const LanguageButton = ({
    lang,
    label,
  }: {
    lang: "pt" | "en";
    label: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.langButton,
        language === lang ? styles.langButtonActive : undefined,
      ]}
      onPress={() => setLanguage(lang)}
    >
      <Text
        style={[
          styles.langButtonText,
          language === lang && styles.langButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  // if viewedProfile is provided, we show it and disable edit/settings/logout
  const viewingOther = !!viewedProfile;
  const shownProfile = viewedProfile ?? profile;

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>
              {viewingOther ? "Perfil" : "Meu Perfil"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <AntDesign name="close" size={24} color="#222" />
            </TouchableOpacity>
          </View>

          <View style={styles.drawerContent}>
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "space-between",
              }}
            >
              <View>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{
                      uri:
                        shownProfile.avatar ??
                        "https://placekitten.com/200/200",
                    }}
                    style={styles.avatar}
                  />
                  <Text style={styles.name}>{shownProfile.name}</Text>
                  <Text style={styles.email}>
                    {shownProfile.email ?? "Email não informado"}
                  </Text>
                </View>

                {/* se estamos vendo outro perfil, não mostramos botão de editar */}
                {!viewingOther && (
                  <>
                    <TouchableOpacity
                      style={styles.option}
                      onPress={handleOpenEdit}
                    >
                      <Feather name="edit" size={20} color="#007aff" />
                      <Text style={styles.optionText}>Editar Perfil</Text>
                    </TouchableOpacity>

                    {/* NOVO: botão "Ver salvos" no mesmo estilo do Editar Perfil */}
                    <TouchableOpacity
                      style={styles.option}
                      onPress={handleViewSaved}
                    >
                      <Feather name="bookmark" size={20} color="#007aff" />
                      <Text style={styles.optionText}>Ver salvos</Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* se estamos vendo outro perfil, podemos mostrar botão de contato */}
                {viewingOther && (
                  <TouchableOpacity
                    style={[styles.option, { marginTop: 8 }]}
                    onPress={() => {
                      // exemplo: abrir email quando disponível
                      if (shownProfile.email) {
                        // Linking can be used here if desired
                        Alert.alert(
                          "Contato",
                          `Enviar email para ${shownProfile.email}`,
                        );
                      } else {
                        Alert.alert("Contato", "Contato não disponível.");
                      }
                    }}
                  >
                    <Feather name="mail" size={20} color="#007aff" />
                    <Text style={styles.optionText}>Contatar</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* ações só para o próprio perfil */}
              {!viewingOther && (
                <View>
                  <TouchableOpacity
                    style={styles.option}
                    onPress={handleOpenSettings}
                  >
                    <Feather name="settings" size={20} color="#007aff" />
                    <Text style={styles.optionText}>Configurações</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.option}
                    onPress={handleRequestLogout}
                  >
                    <Feather name="log-out" size={20} color="red" />
                    <Text style={[styles.optionText, { color: "red" }]}>
                      Sair
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </Animated.View>
      </Modal>

      {/* Edit Profile modal (se o usuário for o próprio, pode editar) */}
      {!viewingOther && (
        <EditProfileModal
          visible={showEditProfile}
          initialData={profile}
          onClose={() => setShowEditProfile(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Settings modal (somente próprio) */}
      {!viewingOther && (
        <Modal
          visible={showSettings}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSettings(false)}
        >
          <View style={styles.centeredOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Configurações</Text>
                <TouchableOpacity onPress={() => setShowSettings(false)}>
                  <AntDesign name="close" size={18} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalContentInner}>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Notificações</Text>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                  />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Modo escuro</Text>
                  <Switch
                    value={darkModeEnabled}
                    onValueChange={setDarkModeEnabled}
                  />
                </View>

                <View style={{ marginTop: 12 }}>
                  <Text style={styles.settingLabel}>Idioma</Text>
                  <View style={{ flexDirection: "row", marginTop: 8 }}>
                    <LanguageButton lang="pt" label="Português" />
                    <LanguageButton lang="en" label="English" />
                  </View>
                </View>

                <View style={{ height: 16 }} />

                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnSecondary]}
                    onPress={() => setShowSettings(false)}
                  >
                    <Text style={styles.btnTextSecondary}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnPrimary]}
                    onPress={handleSaveSettings}
                  >
                    <Text style={styles.btnTextPrimary}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Logout confirm (somente próprio) */}
      {!viewingOther && (
        <Modal
          visible={showLogoutConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLogoutConfirm(false)}
        >
          <View style={styles.centeredOverlay}>
            <View style={styles.modalBoxSmall}>
              <Text style={styles.modalTitle}>Confirmação</Text>
              <Text style={{ marginTop: 8, color: "#444" }}>
                Tem certeza que deseja sair da conta?
              </Text>

              <View style={{ height: 16 }} />

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnSecondary]}
                  onPress={() => setShowLogoutConfirm(false)}
                >
                  <Text style={styles.btnTextSecondary}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnDanger]}
                  onPress={handleConfirmLogout}
                >
                  <Text style={styles.btnTextDanger}>Sair</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

export default ProfileDrawer;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)" },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: "75%",
    backgroundColor: "#f4f6fa",
    paddingVertical: 24,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  drawerTitle: { fontSize: 18, fontWeight: "700", color: "#222" },
  drawerContent: { flex: 1 },

  avatarContainer: { alignItems: "center", marginBottom: 32 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  name: { fontSize: 16, fontWeight: "600", color: "#222" },
  email: { fontSize: 14, color: "#555", marginTop: 4 },

  option: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  optionText: {
    fontSize: 15,
    marginLeft: 12,
    color: "#222",
    fontWeight: "500",
  },

  /* modal interno (editar/settings/logout) */
  centeredOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "86%",
    maxHeight: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  modalBoxSmall: {
    width: "82%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: { fontWeight: "700", fontSize: 16, color: "#222" },
  modalContentInner: { paddingBottom: 12 },

  label: { fontSize: 13, color: "#444", marginBottom: 6 },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
  },

  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },
  btn: {
    minWidth: 96,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  btnPrimary: { backgroundColor: "#007aff" },
  btnTextPrimary: { color: "#fff", fontWeight: "700" },

  btnSecondary: { backgroundColor: "#f2f2f2" },
  btnTextSecondary: { color: "#333", fontWeight: "700" },

  btnDanger: { backgroundColor: "red" },
  btnTextDanger: { color: "#fff", fontWeight: "700" },

  /* settings */
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  settingLabel: { fontSize: 15, color: "#222" },

  /* language buttons */
  langButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    backgroundColor: "#fff",
  },
  langButtonActive: { backgroundColor: "#007aff", borderColor: "#007aff" },
  langButtonText: { color: "#333" },
  langButtonTextActive: { color: "#fff", fontWeight: "700" },
});
