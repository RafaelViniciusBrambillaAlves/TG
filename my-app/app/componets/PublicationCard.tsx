// src/components/PublicationCard.tsx
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { Feather, Entypo } from "@expo/vector-icons";
import { PublicationMock } from "@/hooks/usePublications";
import ProfileModal, { ProfileData } from "./ProfileModal";

type Props = {
  publication: PublicationMock;
  onOpenCenter?: (id?: number | null) => void;
  onShare?: (publication: PublicationMock) => void;
  onSave?: (publication: PublicationMock) => void;
  onReport?: (publication: PublicationMock) => void;
};

export default function PublicationCard({
  publication,
  onOpenCenter,
  onShare,
  onSave,
  onReport,
}: Props) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [profileToView, setProfileToView] = useState<ProfileData | null>(null);

  const authorName =
    (publication as any).author?.name ||
    (publication as any).publisher?.name ||
    publication.centro?.nome_centro ||
    publication.titulo ||
    "Usuário";

  const authorAvatar =
    (publication as any).author?.avatar ||
    (publication as any).publisher?.avatar ||
    publication.centro?.thumbnail ||
    undefined;

  const authorEmail =
    (publication as any).author?.email ||
    (publication as any).publisher?.email ||
    publication.centro?.email ||
    undefined;

  const images =
    publication.images && Array.isArray(publication.images)
      ? publication.images
      : publication.image
      ? [publication.image]
      : [];

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleShare = () => {
    closeMenu();
    if (onShare) return onShare(publication);
    Alert.alert("Compartilhar", "Função de compartilhar não implementada aqui.");
  };

  const handleSave = () => {
    closeMenu();
    if (onSave) return onSave(publication);
    Alert.alert("Salvar", "Publicação salva (placeholder).");
  };

  const handleReport = () => {
    closeMenu();
    if (onReport) return onReport(publication);
    Alert.alert("Denunciar", "Obrigado — sua denúncia foi registrada (placeholder).");
  };

  const openProfile = () => {
    const p: ProfileData = {
      name: authorName,
      email: authorEmail ?? null,
      phone: publication.centro?.telefone ?? null,
      organization: publication.centro?.nome_centro ?? null,
      avatar: authorAvatar ?? null,
    };
    setProfileToView(p);
    setProfileVisible(true);
  };

  return (
    <>
      <View style={styles.card}>
        {/* Header com avatar clicável */}
        <View style={styles.headerRow}>
          <View style={styles.leftRow}>
            <TouchableOpacity onPress={openProfile} accessibilityLabel={`Abrir perfil de ${authorName}`} activeOpacity={0.85}>
              <View style={styles.avatarWrap}>
                {authorAvatar ? (
                  <Image source={{ uri: authorAvatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Feather name="user" size={18} color="#fff" />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.headerText}>
              <Text style={styles.authorName} numberOfLines={1}>
                {authorName}
              </Text>
              <Text style={styles.time}>
                {publication.timeLabel ?? ""} • {publication.local ?? "Local não informado"}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {/* apenas menu "..." no header */}
            <TouchableOpacity style={styles.menuBtn} onPress={openMenu} accessibilityLabel="Mais opções">
              <Entypo name="dots-three-vertical" size={18} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Título / descrição */}
        <Text style={styles.title}>{publication.titulo}</Text>
        {publication.descricao ? <Text style={styles.subtitle}>{publication.descricao}</Text> : null}

        {/* Imagem principal */}
        {publication.image ? (
          <Image source={{ uri: publication.image }} style={styles.mainImage} resizeMode="cover" />
        ) : null}

        {/* Scroll de imagens adicionais (se houver) */}
        {images.length > 0 && images.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {images.map((img, idx) => (
              <Image key={idx} source={{ uri: img }} style={styles.scrollImage} resizeMode="cover" />
            ))}
          </ScrollView>
        )}

        {/* Rodapé minimalista */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>...</Text>
        </View>
      </View>

      {/* Modal menu (aba inferior) */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={closeMenu}>
        <Pressable style={styles.menuOverlay} onPress={closeMenu}>
          <View style={styles.menuBox}>
            <TouchableOpacity style={styles.menuItem} onPress={handleSave}>
              <Feather name="bookmark" size={18} color="#111" />
              <Text style={styles.menuItemText}>Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
              <Feather name="share-2" size={18} color="#111" />
              <Text style={styles.menuItemText}>Compartilhar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                onOpenCenter?.(publication.centro?.id_centro ?? null);
              }}
            >
              <Feather name="target" size={18} color="#111" />
              <Text style={styles.menuItemText}>Ir para Centro</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleReport}>
              <Feather name="alert-circle" size={18} color="#e53e3e" />
              <Text style={[styles.menuItemText, { color: "#e53e3e" }]}>Denunciar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Modal de perfil centralizado */}
      <ProfileModal
        visible={profileVisible}
        onClose={() => {
          setProfileVisible(false);
          setProfileToView(null);
        }}
        profile={profileToView}
      />
    </>
  );
}

const AVATAR_SIZE = 44;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  leftRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatarWrap: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, overflow: "hidden", marginRight: 12 },
  avatar: { width: "100%", height: "100%" },
  avatarPlaceholder: { flex: 1, backgroundColor: "#9CA3AF", alignItems: "center", justifyContent: "center" },

  headerText: { flex: 1, minWidth: 0 },
  authorName: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  time: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  headerActions: { flexDirection: "row", alignItems: "center", marginLeft: 8 },
  menuBtn: { marginLeft: 8, paddingHorizontal: 6, paddingVertical: 6 },

  title: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginTop: 10 },
  subtitle: { fontSize: 14, color: "#374151", marginTop: 8 },

  mainImage: { width: "100%", height: 180, borderRadius: 12, marginTop: 10, backgroundColor: "#f2f2f2" },
  imageScroll: { marginTop: 10 },
  scrollImage: { width: 120, height: 120, borderRadius: 12, marginRight: 8, backgroundColor: "#f2f2f2" },

  footerRow: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "flex-start" },
  footerText: { color: "#6B7280", fontWeight: "700" },

  /* menu modal */
  menuOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  menuBox: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  menuItemText: { marginLeft: 12, fontWeight: "600", color: "#111", fontSize: 15 },
  menuDivider: { height: 1, backgroundColor: "#EEE", marginVertical: 6 },
});
