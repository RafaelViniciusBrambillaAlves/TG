// src/components/PublicationCard.tsx
import React, { useEffect, useMemo, useState } from "react";
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
  Platform,
  ActivityIndicator,
} from "react-native";
import { Feather, Entypo } from "@expo/vector-icons";
import { PublicationMock } from "@/hooks/usePublications";
import ProfileModal, { ProfileData } from "./ProfileModal";
import api from "@/services/api";

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
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // heurística simples para identificar id strings curtas/longas
  const isLikelyId = (s: string) => /^[0-9a-fA-F]{6,}$/.test(s);

  function resolveImageUrl(raw?: any): string | undefined {
    if (!raw) return undefined;

    if (typeof raw === "string") {
      const s = raw.trim();
      if (s.startsWith("http://") || s.startsWith("https://")) return s;
      if (s.startsWith("/")) return `http://localhost:3001${s}`;
      if (s.startsWith("uploads/") || s.includes("/uploads/"))
        return `http://localhost:3001${s}`;
      if (isLikelyId(s)) return `http://localhost:3001/api/v1/files/${s}`;
      return `http://localhost:3001${s}`;
    }

    if (typeof raw === "object") {
      if (raw.url && typeof raw.url === "string") {
        const s = raw.url;
        if (s.startsWith("http")) return s;
        if (s.startsWith("/")) return `http://localhost:3001${s}`;
        return `http://localhost:3001${s}`;
      }
      if (raw.path && typeof raw.path === "string") {
        const s = raw.path;
        if (s.startsWith("http")) return s;
        if (s.startsWith("/")) return `http://localhost:3001${s}`;
        return `http://localhost:3001${s}`;
      }
      const id = raw.fileId ?? raw._id ?? raw.id;
      if (id && typeof id === "string")
        return `http://localhost:3001/api/v1/files/${id}`;
    }

    return undefined;
  }

  // imagens normalizadas (main + gallery)
  const imagesRaw =
    publication.image && Array.isArray(publication.image)
      ? publication.image
      : publication.image
        ? [publication.image]
        : [];

  const images = imagesRaw
    .map((i) => resolveImageUrl(i))
    .filter((u): u is string => !!u);

  // descoberta do autor (robusta)
  const candidateAuthor =
    (publication as any).author ||
    (publication as any).publisher ||
    (publication as any).usuario ||
    (publication as any).user ||
    (publication as any).usuario_id ||
    null;

  const extractUserId = (c: any) => {
    if (!c) return undefined;
    if (typeof c === "string" || typeof c === "number") return String(c);
    if (c._id) return String(c._id);
    if (c.id) return String(c.id);
    if (c.usuario_id) return String(c.usuario_id);
    return undefined;
  };

  const candidateUserId = extractUserId(candidateAuthor);

  const [loadingAuthor, setLoadingAuthor] = useState(false);
  const [fetchedAuthor, setFetchedAuthor] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    const aborter = new AbortController();

    async function fetchAuthorById(id: string) {
      setLoadingAuthor(true);
      try {
        const res = await api.get(`/api/v1/usuarios/${id}`, {
          signal: aborter.signal,
        });
        if (!mounted) return;
        setFetchedAuthor(res?.data ?? null);
      } catch {
        setFetchedAuthor(null);
      } finally {
        if (mounted) setLoadingAuthor(false);
      }
    }

    const hasInlineName =
      candidateAuthor &&
      (candidateAuthor.name || candidateAuthor.nome || candidateAuthor.email);

    if (!hasInlineName && candidateUserId) {
      fetchAuthorById(candidateUserId);
    } else {
      setFetchedAuthor(null);
    }

    return () => {
      mounted = false;
      aborter.abort();
    };
  }, [candidateUserId, publication._id]);

  const authorObj = useMemo(() => {
    if (candidateAuthor && typeof candidateAuthor === "object")
      return candidateAuthor;
    if (fetchedAuthor) return fetchedAuthor;
    if ((publication as any).centro) return (publication as any).centro;
    return null;
  }, [candidateAuthor, fetchedAuthor, publication.centro]);

  const authorName =
    (authorObj &&
      (authorObj.name ||
        authorObj.nome ||
        authorObj.nome_centro ||
        authorObj.fullName)) ||
    (publication as any).nome_autor ||
    "Usuário";

  const authorAvatar = resolveImageUrl(
    (authorObj && (authorObj.image || authorObj.avatar || authorObj.foto)) ||
      (publication as any).image ||
      (publication as any).avatar ||
      undefined,
  );

  // ---------- TIME LABEL: computeTimeAgo similar ao PostCard.tsx ----------

  const timeLabel = useMemo(() => {
    const raw = (publication as any).createdAtRaw ?? null;
    if (!raw) return "";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return "";

    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 3600 * 24) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / (3600 * 24))}d`;
  }, [publication]);

  // ---------- ORGANIZAÇÃO: extraída do authorObj, similar ao PostCard.tsx ----------
  const authorOrg =
    authorObj?.organizacoes?.[0]?.name ||
    authorObj?.organizacao ||
    authorObj?.organization ||
    (publication as any).organizacao ||
    (publication as any).org ||
    "";

  // texto da publicação (só o corpo, conforme pedido)
  const publicationText =
    publication.descricao ?? publication.texto ?? publication.titulo ?? "";

  // ações UI
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleShare = () => {
    closeMenu();
    if (onShare) return onShare(publication);
    Alert.alert("Compartilhar", "Funcionalidade de compartilhar (simulada).");
  };

  const handleSave = () => {
    closeMenu();
    if (onSave) return onSave(publication);
    Alert.alert("Salvar", "Publicação salva (simulado).");
  };

  const handleReport = () => {
    closeMenu();
    if (onReport) return onReport(publication);
    Alert.alert("Denunciar", "Obrigado — denúncia registrada (simulado).");
  };

  const openProfile = () => {
    const p = authorObj ?? null;
    setProfileToView(p);
    setProfileVisible(true);
  };
  return (
    <>
      <View style={styles.card}>
        {/* header */}
        <View style={styles.headerRow}>
          <View style={styles.leftRow}>
            <TouchableOpacity
              onPress={openProfile}
              accessibilityLabel={`Abrir perfil de ${authorName}`}
              activeOpacity={0.85}
            >
              <View style={styles.avatarWrap}>
                {loadingAuthor ? (
                  <View
                    style={[
                      styles.avatarPlaceholder,
                      { justifyContent: "center" },
                    ]}
                  >
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                ) : authorAvatar ? (
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

              {/* linha meta: organização • tempo, na MESMA LINHA e sem quebra */}
              <View style={styles.meta}>
                {authorOrg ? (
                  <Text
                    style={styles.authorOrg}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {authorOrg}
                  </Text>
                ) : null}

                {/* se tem organização e tempo, mostra o bullet entre eles */}
                {authorOrg && timeLabel ? (
                  <Text style={styles.dot}>•</Text>
                ) : null}

                {/* tempo sempre visível (se houver), e sempre na mesma linha */}
                {timeLabel ? (
                  <Text style={styles.time}>{timeLabel}</Text>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.menuBtn}
              onPress={openMenu}
              accessibilityLabel="Mais opções"
            >
              <Entypo name="dots-three-vertical" size={18} color="#444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* texto da publicação (somente corpo) */}
        {publicationText ? (
          <Text style={styles.publicationText}>{publicationText}</Text>
        ) : null}

        {/* imagem principal (com loading/fallback) */}
        {images.length > 0 && (
          <View style={styles.imageContainer}>
            {imageLoading && (
              <View style={styles.imageLoader}>
                <ActivityIndicator size="small" color="#999" />
              </View>
            )}
            <Image
              source={{ uri: images[0] }}
              style={styles.mainImage}
              resizeMode="cover"
              onLoadStart={() => {
                setImageLoading(true);
                setImageError(false);
              }}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
            {imageError && (
              <View style={styles.imageError}>
                <Text style={styles.imageErrorText}>Imagem indisponível</Text>
              </View>
            )}
          </View>
        )}

        {/* galeria de thumbnails quando >1 */}
        {images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
          >
            {images.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: img }}
                style={styles.scrollImage}
                resizeMode="cover"
                accessibilityLabel={`Imagem ${idx + 1}`}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* menu modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
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
              <Text style={[styles.menuItemText, { color: "#e53e3e" }]}>
                Denunciar
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* profile modal */}
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

/* STYLES */
const AVATAR_SIZE = 48;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    shadowColor: "#000",
    shadowOpacity: Platform.OS === "ios" ? 0.04 : 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  leftRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: "transparent",
  },
  avatar: { width: "100%", height: "100%" },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: { flex: 1, minWidth: 0 },
  authorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },

  // meta: organização + bullet + tempo — agora sem quebra
  meta: { flexDirection: "row", alignItems: "center", flexWrap: "nowrap" },
  authorOrg: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    maxWidth: 200, // evita overflow que quebre a linha; ajuste conforme necessidade
  },
  dot: { fontSize: 13, color: "#6B7280", marginHorizontal: 6 },
  time: { fontSize: 12, color: "#6B7280" },

  headerActions: { flexDirection: "row", alignItems: "center", marginLeft: 8 },
  menuBtn: { marginLeft: 8, paddingHorizontal: 6, paddingVertical: 6 },

  publicationText: {
    fontSize: 15,
    fontWeight: "400",
    color: "#0F172A",
    marginTop: 10,
    lineHeight: 20,
  },

  imageContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f2f2f2",
  },
  imageLoader: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  mainImage: { width: "100%", height: 200 },
  imageError: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  imageErrorText: { color: "#666", fontSize: 14 },

  imageScroll: { marginTop: 10 },
  scrollImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: "#f2f2f2",
  },

  /* menu modal */
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  menuBox: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  menuItemText: {
    marginLeft: 12,
    fontWeight: "600",
    color: "#111",
    fontSize: 15,
  },
  menuDivider: { height: 1, backgroundColor: "#EEE", marginVertical: 6 },
});
