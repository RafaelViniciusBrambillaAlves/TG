// src/components/ProfileDrawer.tsx
import React, { useEffect, useMemo, useState } from "react";
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
import { useAuth } from "@/context/auth.context";
import { useRouter } from "expo-router";
import { Organizacao } from "./OrganizationCard";
import EditProfileModal, { ProfileData } from "./EditProfileModal";

// Normaliza possíveis formatos de id (string, {_id}, {id}, {id_organizacao})
function normalizeOrgId(input: any): string | null {
  if (!input) return null;
  if (typeof input === "string") return input || null;
  if (typeof input === "object") return input._id || input.id || input.id_organizacao || null;
  return null;
}

// Resolve imagem relativa em URL absoluta (ou devolve a original se já for http)
function resolveServerImage(img?: string | null): string | null {
  if (!img || typeof img !== "string" || img.trim() === "") return null;
  if (/^https?:\/\//.test(img)) return img;
  if (img.startsWith("/")) return `http://localhost:3001${img}`;
  return `http://localhost:3001/${img.replace(/^\/+/, "")}`;
}

function timeAgo(iso?: string) {
  if (!iso) return "";
  try {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 3600 * 24) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / (3600 * 24))}d`;
  } catch {
    return "";
  }
}

export const ProfileDrawer = ({
  visible,
  onClose,
  onLogout,
  viewedProfile,
  onViewSaved,
  organizations,
}: {
  visible: boolean;
  onClose: () => void;
  onLogout?: () => void;
  viewedProfile?: ProfileData | null; // se passar, mostra esse perfil em modo visualização
  onViewSaved?: () => void; // callback quando o usuário clicar em "Ver salvos"
  organizations?: Organizacao[]; // agregado vindo do servidor com centros por organização
}) => {
  const [animation] = useState(new Animated.Value(0));
  const { user, signOut } = useAuth();
  const router = useRouter();

  // internal modals
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // profile data (local) -> usado quando estiver visualizando o "próprio" perfil
  const [profile, setProfile] = useState<ProfileData>({
    _id: user?._id || "",
    name: user?.username || "",
    email: user?.email || "",
    phone: user?.telefone || "",
    address: {},
    avatar: user?.image,
    organizations: user?.organizations || [],
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
    setShowSettings(false);
  };

  const handleViewSaved = () => {
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

  const viewingOther = !!viewedProfile;
  const shownProfile = viewedProfile ?? profile;

  // Determina o orgId ativo a partir do perfil (primeira organização do usuário)
  const activeOrgId = useMemo(() => {
    const fromProfile = normalizeOrgId(shownProfile?.organizations?.[0]);
    if (fromProfile) return fromProfile;
    const fromProp = normalizeOrgId(organizations?.[0]);
    return fromProp;
  }, [shownProfile?.organizations, organizations]);

  // Encontra a organização no agregado (organizations prop) e pega os centros (sem renomear campos)
  const centersFromActiveOrg = useMemo(() => {
    if (!organizations || !activeOrgId) return [] as any[];
    const found = (organizations as any[]).find(
      (o) =>
        (o && (o as any).id_organizacao === activeOrgId) ||
        (o && (o as any)._id === activeOrgId),
    );
    const centros = (found as any)?.centros ?? [];
    return Array.isArray(centros) ? centros : [];
  }, [organizations, activeOrgId]);

  const uri = resolveServerImage(shownProfile.avatar);
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
                      uri: uri ? `${uri}?v=${Date.now()}` : "",
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

                    <TouchableOpacity
                      style={styles.option}
                      onPress={handleViewSaved}
                    >
                      <Feather name="bookmark" size={20} color="#007aff" />
                      <Text style={styles.optionText}>Ver salvos</Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* Bloco da Organização do usuário */}
                {(() => {
                  const org = shownProfile?.organizations?.[0] as any;
                  const hasOrg =
                    !!org && (org.name || org.description || org.phone || org.website);

                  if (!hasOrg) {
                    return (
                      <View style={styles.orgCard}>
                        <Text style={styles.orgHeader}>Organização</Text>
                        <Text style={styles.orgEmpty}>Nenhuma organização vinculada.</Text>
                      </View>
                    );
                  }

                  return (
                    <View style={styles.orgCard}>
                      <Text style={styles.orgHeader}>Organização</Text>

                      {!!org?.name && (
                        <View style={styles.orgRow}>
                          <Text style={styles.orgLabel}>Nome</Text>
                          <Text style={styles.orgValue}>{org.name}</Text>
                        </View>
                      )}

                      {!!org?.description && (
                        <View style={styles.orgRow}>
                          <Text style={styles.orgLabel}>Descrição</Text>
                          <Text style={styles.orgValue}>{org.description}</Text>
                        </View>
                      )}

                      {!!org?.phone && (
                        <View style={styles.orgRow}>
                          <Text style={styles.orgLabel}>Telefone</Text>
                          <Text style={styles.orgValue}>{org.phone}</Text>
                        </View>
                      )}

                      {!!org?.website && (
                        <View style={styles.orgRow}>
                          <Text style={styles.orgLabel}>Website</Text>
                          <Text style={[styles.orgValue, styles.orgValueLink]}>
                            {org.website}
                          </Text>
                        </View>
                      )}

                      {!!org?.logo && (
                        <Image source={{ uri: org.logo }} style={styles.orgLogo} />
                      )}
                    </View>
                  );
                })()}

                {/* Centros da organização do perfil e suas necessidades (usando campos originais) */}
                <View style={styles.orgCard}>
                  <Text style={styles.orgHeader}>Centros da organização</Text>
                  {!activeOrgId ? (
                    <Text style={styles.orgEmpty}>
                      Não foi possível identificar a organização do usuário.
                    </Text>
                  ) : organizations && organizations.length > 0 ? (
                    centersFromActiveOrg.length > 0 ? (
                      <View style={styles.centersList}>
                        {centersFromActiveOrg.map((c: any) => {
                          const centerImg = resolveServerImage(c.image);
                          const necessidades = Array.isArray(c.necessidades) ? c.necessidades : [];
                          return (
                            <View key={c.id_centro || c._id || c.id} style={styles.centerBlock}>
                              <View style={styles.centerRow}>
                                {centerImg ? (
                                  <Image source={{ uri: centerImg }} style={styles.centerThumb} />
                                ) : (
                                  <View style={[styles.centerThumb, styles.centerThumbEmpty]}>
                                    <Text style={{ color: "#666", fontSize: 10 }}>Sem foto</Text>
                                  </View>
                                )}
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.centerName}>{c.nome}</Text>
                                  {!!c.endereco && (
                                    <Text style={styles.centerAddress}>{c.endereco}</Text>
                                  )}
                                  {!!c.telefone && (
                                    <Text style={styles.centerAddress}>Tel: {c.telefone}</Text>
                                  )}
                                </View>
                              </View>

                              {/* Lista de necessidades desse centro (campos originais) */}
                              {necessidades.length > 0 ? (
                                <View style={styles.needsList}>
                                  {necessidades.map((n: any) => {
                                    const needImg = resolveServerImage(n.image);
                                    return (
                                      <View key={n._id} style={styles.needCard}>
                                        <View style={styles.needHeader}>
                                          <Text style={styles.needTitle}>{n.title}</Text>
                                          <View style={styles.badgesRow}>
                                            {!!n.type && (
                                              <Text style={styles.badge}>{n.type}</Text>
                                            )}
                                            {!!n.status && (
                                              <Text style={[styles.badge, styles.badgeMuted]}>
                                                {n.status}
                                              </Text>
                                            )}
                                          </View>
                                        </View>

                                        {!!needImg && (
                                          <Image
                                            source={{ uri: needImg }}
                                            style={styles.needImage}
                                          />
                                        )}

                                        {!!n.description && (
                                          <Text style={styles.needDesc}>{n.description}</Text>
                                        )}

                                        <View style={styles.needFooter}>
                                          {!!n.quantity && (
                                            <Text style={styles.needMeta}>
                                              Quantidade: {n.quantity}
                                            </Text>
                                          )}
                                          {!!n.createdAt && (
                                            <Text style={styles.needMeta}>
                                              Criado há {timeAgo(n.createdAt)}
                                            </Text>
                                          )}
                                          <Text style={styles.needMeta}>
                                            Interessados: {Array.isArray(n.interest) ? n.interest.length : 0}
                                          </Text>
                                        </View>
                                      </View>
                                    );
                                  })}
                                </View>
                              ) : (
                                <Text style={styles.orgEmpty}>
                                  Nenhuma necessidade cadastrada para este centro.
                                </Text>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    ) : (
                      <Text style={styles.orgEmpty}>Nenhum centro encontrado para esta organização.</Text>
                    )
                  ) : (
                    <Text style={styles.orgEmpty}>
                      Lista de organizações não fornecida ao componente.
                    </Text>
                  )}
                </View>

                {/* se estamos vendo outro perfil, mostramos botão de contato */}
                {viewingOther && (
                  <TouchableOpacity
                    style={[styles.option, { marginTop: 8 }]}
                    onPress={() => {
                      if (shownProfile.email) {
                        Alert.alert("Contato", `Enviar email para ${shownProfile.email}`);
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
                    {/*<LanguageButton lang="pt" label="Português" />
                    <LanguageButton lang="en" label="English" />*/}
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

  orgCard: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EAEEF6",
  },
  orgHeader: {
    color: "#0b1220",
    fontWeight: "800",
    marginBottom: 8,
  },
  orgEmpty: {
    color: "#6B7280",
    fontSize: 13,
  },
  orgRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  orgLabel: {
    color: "#6B7280",
    fontWeight: "600",
    minWidth: 88,
  },
  orgValue: {
    color: "#111827",
    flexShrink: 1,
    textAlign: "right",
  },
  orgValueLink: {
    color: "#0b82ff",
    fontWeight: "600",
  },

  // Lista de centros e necessidades
  centersList: {
    marginTop: 8,
    gap: 12,
  },
  centerBlock: {
    paddingVertical: 8,
  },
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  centerThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#f0f3f8",
    borderWidth: 1,
    borderColor: "#e8edf4",
    marginRight: 4,
  },
  centerThumbEmpty: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerName: {
    color: "#0b1220",
    fontWeight: "700",
  },
  centerAddress: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2,
  },

  // Necessidades
  needsList: {
    marginTop: 8,
    gap: 8,
  },
  needCard: {
    borderWidth: 1,
    borderColor: "#EAEEF6",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#fafcff",
    marginTop: 6,
  },
  needHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  needTitle: {
    color: "#0b1220",
    fontWeight: "800",
    flexShrink: 1,
    paddingRight: 8,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 6,
  },
  badge: {
    backgroundColor: "#0b82ff",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 11,
  },
  badgeMuted: {
    backgroundColor: "#9aa5b1",
  },
  needImage: {
    width: "100%",
    height: 140,
    borderRadius: 8,
    marginTop: 8,
  },
  needDesc: {
    color: "#334155",
    marginTop: 8,
  },
  needFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  needMeta: {
    color: "#64748b",
    fontSize: 12,
  },
});
