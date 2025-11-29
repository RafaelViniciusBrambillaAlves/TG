// src/components/ProfileModal.tsx
import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
  Linking,
  Alert,
} from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Organizacao } from "./OrganizationCard";

export type ProfileData = {
  nome: string;
  email?: string | null;
  phone?: string | null;
  organizacoes?: Organizacao[];
  image?: string | null;
  telefone?: string | null;
};

export default function ProfileModal({
  visible,
  onClose,
  profile,
}: {
  visible: boolean;
  onClose: () => void;
  profile: ProfileData | null | undefined;
}) {
  if (!profile) return null;

  const openMail = (email?: string | null) => {
    if (!email) return Alert.alert("Email não disponível");
    Linking.openURL(`mailto:${email}`).catch(() =>
      Alert.alert("Erro", "Não foi possível abrir o cliente de email."),
    );
  };

  const openWhatsApp = (phone?: string | null) => {
    if (!phone) return Alert.alert("Telefone não disponível");
    let digits = phone.replace(/\D+/g, "");
    if (digits.length <= 11) digits = `55${digits}`;
    const web = `https://wa.me/${digits}`;
    const native = `whatsapp://send?phone=${digits}`;
    Linking.canOpenURL(native)
      .then((can) => (can ? Linking.openURL(native) : Linking.openURL(web)))
      .catch(() => Alert.alert("Erro", "Não foi possível abrir o WhatsApp."));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityLabel="Fechar perfil"
      >
        {/* Pressable captura toque no overlay; conteúdo usa pointerEvents="box-none" para permitir interação */}
        <View style={styles.centerWrap} pointerEvents="box-none">
          <View style={styles.modalBox}>
            <View style={styles.header}>
              <Text style={styles.title}>Perfil</Text>
              <TouchableOpacity onPress={onClose} accessibilityLabel="Fechar">
                <AntDesign name="close" size={20} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.avatarRow}>
              {profile.image ? (
                <Image
                  source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${profile?.image}` }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Feather name="user" size={28} color="#fff" />
                </View>
              )}
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {profile.nome}
                </Text>
              </View>
            </View>
            <Text style={styles.title}>Organização do autor</Text>
            <View style={styles.avatarRow}>
              {profile?.organizacoes?.[0]?.logo ? (
                <Image
                  source={{ uri: profile?.organizacoes?.[0]?.logo }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Feather name="user" size={28} color="#fff" />
                </View>
              )}
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.org} numberOfLines={1}>
                  {profile?.organizacoes?.[0]?.name}
                </Text>
              </View>
            </View>

            <View style={styles.info}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{profile.email ?? "—"}</Text>

              <Text style={[styles.label, { marginTop: 12 }]}>Telefone</Text>
              <Text style={styles.value}>{profile.telefone ?? "—"}</Text>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  !profile.email && styles.actionBtnDisabled,
                ]}
                onPress={() => openMail(profile.email)}
                disabled={!profile.email}
                accessibilityLabel="Enviar email"
              >
                <Feather
                  name="mail"
                  size={16}
                  color={profile.email ? "#fff" : "#9CA3AF"}
                />
                <Text
                  style={[
                    styles.actionText,
                    !profile.email && { color: "#9CA3AF" },
                  ]}
                >
                  Email
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  !profile.phone && styles.actionBtnDisabled,
                ]}
                onPress={() => openWhatsApp(profile.phone)}
                disabled={!profile.phone}
                accessibilityLabel="Abrir WhatsApp"
              >
                <Feather
                  name="message-circle"
                  size={16}
                  color={profile.phone ? "#fff" : "#9CA3AF"}
                />
                <Text
                  style={[
                    styles.actionText,
                    !profile.phone && { color: "#9CA3AF" },
                  ]}
                >
                  WhatsApp
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.32)",
    alignItems: "center",
    justifyContent: "center",
  },
  centerWrap: {
    width: "100%",
    paddingHorizontal: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    minWidth: 280,
    maxWidth: 420,
    alignSelf: "center",
    // shadow
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "700", color: "#111" },

  avatarRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  org: { fontSize: 13, color: "#6B7280", marginTop: 4, fontWeight: "600" },

  info: { marginTop: 14 },
  label: { fontSize: 12, color: "#374151", fontWeight: "700" },
  value: { fontSize: 14, color: "#111", marginTop: 6 },

  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
    justifyContent: "space-between",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#3B82F6",
  },
  actionBtnDisabled: { backgroundColor: "#F1F5F9" },
  actionText: { color: "#fff", fontWeight: "700", marginLeft: 8 },
});
