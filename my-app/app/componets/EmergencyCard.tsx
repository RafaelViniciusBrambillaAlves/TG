import React, { useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
  Pressable,
  Modal,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
  Share,
  Alert,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import EmergencyDetails from "./EmergencyDetails";
import EmergencyHelp from "./EmergencyHelp";
import EmergencyLocation from "./EmergencyLocation";

export type EmergencyType = {
  id: number | string;
  titulo: string;
  subtitulo?: string;
  descricao?: string;
  timeLabel?: string;
  severity?: "warning" | "danger" | "info";
  image?: string;
  images?: string[];
  id_endereco?: number | null;
  centros?: any;
};

type Props = { item: EmergencyType };
type SubTab = "details" | "location" | "help" | null;

const CARD_HORIZONTAL_MARGIN = 16;

export default function EmergencyCard({ item }: Props) {
  const [openTab, setOpenTab] = useState<SubTab>(null);

  // carousel / layout
  const scrollRef = useRef<ScrollView | null>(null);
  const window = useWindowDimensions();
  const defaultCarouselWidth = Math.max(
    240,
    window.width - CARD_HORIZONTAL_MARGIN * 2 - 48,
  );
  const [carouselWidth, setCarouselWidth] =
    useState<number>(defaultCarouselWidth);
  const [activeIndex, setActiveIndex] = useState(0);

  // image loading
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // fullscreen modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState<number>(0);

  // share banner (feedback)
  const [shareBanner, setShareBanner] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // images list normalized
  const images = useMemo(() => {
    if (Array.isArray(item.images) && item.images.length > 0)
      return item.images;
    if (item.image) return [item.image];
    return [];
  }, [item.images, item.image]);

  const severityColor = useMemo(() => {
    if (item.severity === "danger") return "#D23B3B";
    if (item.severity === "warning") return "#F59E0B";
    return "#2563EB";
  }, [item.severity]);

  const severityLabel = useMemo(() => {
    if (item.severity === "danger") return "Perigo";
    if (item.severity === "warning") return "Alerta";
    return "Info";
  }, [item.severity]);

  const toggleTab = (tab: Exclude<SubTab, null>) => {
    setOpenTab((prev) => (prev === tab ? null : tab));
  };

  const onLayoutCarousel = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w && w !== carouselWidth) {
      setCarouselWidth(w);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: activeIndex * w, animated: false });
      }, 0);
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    if (!carouselWidth) return;
    const idx = Math.round(x / carouselWidth);
    if (idx !== activeIndex) setActiveIndex(idx);
  };

  const goToIndex = (idx: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ x: idx * carouselWidth, animated: true });
    setActiveIndex(idx);
  };

  const openImageModal = (index = 0) => {
    setModalImageIndex(index);
    setModalVisible(true);
  };
  const closeImageModal = () => setModalVisible(false);

  const normalizeSrc = (uri: string) =>
    uri && uri.startsWith("http") ? uri : `${process.env.EXPO_PUBLIC_API_URL}${uri}`;

  // ---------------- SHARE LOGIC ----------------
  // Build a nice share text
  const buildShareText = (e: EmergencyType) => {
    const lines: string[] = [];
    lines.push(`${e.titulo}`);
    if (e.subtitulo) lines.push(e.subtitulo);
    if (e.timeLabel) lines.push(`(${e.timeLabel})`);
    if (e.descricao) {
      // keep it short: first 200 chars
      const trimmed =
        e.descricao.length > 200
          ? e.descricao.slice(0, 197) + "..."
          : e.descricao;
      lines.push("");
      lines.push(trimmed);
    }
    lines.push("");
    // if you have a deep link route (example), include it — adapt as needed
    try {
      const deep = `app://emergencia/${e.id}`;
      lines.push(`Ver no app: ${deep}`);
    } catch {}
    return lines.join("\n");
  };

  // show banner for 3s
  const showBanner = (type: "success" | "error" | "info", text: string) => {
    setShareBanner({ type, text });
    setTimeout(() => setShareBanner(null), 3000);
  };

  // share handler (native / web / fallback)
  const handleShare = async () => {
    try {
      const text = buildShareText(item);
      const imageUrl = images.length ? normalizeSrc(images[0]) : undefined;

      // Mobile native share (iOS / Android)
      if (Platform.OS === "android" || Platform.OS === "ios") {
        const payload: any = { message: text };
        if (imageUrl) payload.url = imageUrl;
        const result = await Share.share(payload);
        // result may contain action / activityType; treat as success
        showBanner("success", "Compartilhamento iniciado");
        console.log("share result:", result);
        return;
      }

      // Web: try navigator.share if available
      // @ts-ignore
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        try {
          // @ts-ignore
          await (navigator as any).share({
            title: item.titulo,
            text,
            url: imageUrl,
          });
          showBanner("success", "Compartilhamento concluído");
          return;
        } catch (err) {
          // user cancelled or failed — continue to fallback
          console.log("navigator.share error:", err);
        }
      }

      // Web fallback: copy to clipboard if available
      // @ts-ignore
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        try {
          // @ts-ignore
          await navigator.clipboard.writeText(
            text + (imageUrl ? `\n\n${imageUrl}` : ""),
          );
          showBanner("info", "Conteúdo copiado para a área de transferência");
          return;
        } catch (err) {
          console.log("clipboard write failed:", err);
        }
      }

      // final fallback: open mail client
      const subject = encodeURIComponent(`Emergência: ${item.titulo}`);
      const body = encodeURIComponent(
        text + (imageUrl ? `\n\n${imageUrl}` : ""),
      );
      const mailto = `mailto:?subject=${subject}&body=${body}`;
      try {
        await Linking.openURL(mailto);
        showBanner("info", "Abrindo cliente de email...");
      } catch (err) {
        // extremely fallback: alert with text
        Alert.alert(
          "Compartilhar",
          "Não foi possível abrir recursos de compartilhamento neste dispositivo.",
        );
        showBanner("error", "Compartilhamento não disponível");
      }
    } catch (err) {
      console.error("handleShare error:", err);
      showBanner("error", "Falha ao preparar o compartilhamento");
    }
  };

  // ---------------- RENDER ----------------
  const renderCarousel = () => {
    if (!images.length) return null;

    if (images.length === 1) {
      const uri = normalizeSrc(images[0]);
      return (
        <View style={styles.thumbnailWrap}>
          <TouchableOpacity
            onPress={() => openImageModal(0)}
            activeOpacity={0.9}
            accessibilityRole="imagebutton"
            accessibilityLabel="Abrir imagem em tela cheia"
          >
            <View style={styles.thumbInner}>
              {imageLoading && (
                <ActivityIndicator style={styles.thumbLoader} size="small" />
              )}
              <Image
                source={{ uri }}
                style={styles.thumbnail}
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
                <View style={styles.thumbFallback}>
                  <Text style={styles.thumbFallbackText}>
                    Imagem indisponível
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.carouselOuter} onLayout={onLayoutCarousel}>
        <ScrollView
          ref={(r) => (scrollRef.current = r)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ alignItems: "center" }}
        >
          {images.map((uri, i) => {
            const src = normalizeSrc(uri);
            return (
              <TouchableOpacity
                key={String(i)}
                style={[styles.imageWrap, { width: carouselWidth }]}
                activeOpacity={0.95}
                onPress={() => openImageModal(i)}
                accessibilityRole="imagebutton"
                accessibilityLabel={`Abrir imagem ${i + 1} em tela cheia`}
              >
                <Image
                  source={{ uri: src }}
                  style={[styles.image, { width: carouselWidth }]}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {images.length > 1 && (
          <View style={styles.dotsWrap} pointerEvents="box-none">
            {images.map((_, i) => (
              <Pressable
                key={String(i)}
                onPress={() => goToIndex(i)}
                style={[styles.dot, activeIndex === i && styles.dotActive]}
                accessibilityLabel={`Página ${i + 1}`}
                android_ripple={{ color: "rgba(0,0,0,0.06)", radius: 12 }}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.card}>
      {/* share banner (discrete) */}
      {shareBanner && (
        <View
          style={[
            styles.shareBanner,
            shareBanner.type === "success"
              ? styles.shareBannerSuccess
              : shareBanner.type === "error"
                ? styles.shareBannerError
                : styles.shareBannerInfo,
          ]}
        >
          <Text style={styles.shareBannerText}>{shareBanner.text}</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.rowTop}>
          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={2}>
              {item.titulo}
            </Text>

            <View
              style={[styles.badge, { backgroundColor: `${severityColor}22` }]}
            >
              <View
                style={[styles.badgeDot, { backgroundColor: severityColor }]}
              />
              <Text style={styles.badgeText}>{severityLabel}</Text>
            </View>
          </View>

          <View style={styles.actionIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              accessibilityLabel="Salvar emergência"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.75}
              onPress={() => {
                // placeholder: salvar ação
                showTemporaryAlert("Salvo", "Emergência salva (simulado)");
              }}
            >
              <Feather name="bookmark" size={20} color="#475569" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              accessibilityLabel="Compartilhar emergência"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.75}
              onPress={handleShare}
            >
              <Feather name="share-2" size={20} color="#475569" />
            </TouchableOpacity>
          </View>
        </View>

        {item.subtitulo ? (
          <Text style={styles.subtitle}>{item.subtitulo}</Text>
        ) : null}
        {item.timeLabel ? (
          <Text style={styles.time}>{item.timeLabel}</Text>
        ) : null}

        {renderCarousel()}

        <View style={styles.tabRow}>
          <TouchableOpacity
            onPress={() => toggleTab("details")}
            style={styles.tabBtn}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ expanded: openTab === "details" }}
          >
            <Text
              style={[
                styles.tabText,
                openTab === "details" && styles.tabTextActive,
              ]}
            >
              Detalhes
            </Text>
            {openTab === "details" && <View style={styles.underline} />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => toggleTab("location")}
            style={styles.tabBtn}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ expanded: openTab === "location" }}
          >
            <Text
              style={[
                styles.tabText,
                openTab === "location" && styles.tabTextActive,
              ]}
            >
              Localização
            </Text>
            {openTab === "location" && <View style={styles.underline} />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => toggleTab("help")}
            style={styles.tabBtn}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ expanded: openTab === "help" }}
          >
            <Text
              style={[
                styles.tabText,
                openTab === "help" && styles.tabTextActive,
              ]}
            >
              Ajudar
            </Text>
            {openTab === "help" && <View style={styles.underline} />}
          </TouchableOpacity>
        </View>

        <View>
          {openTab === "details" && <EmergencyDetails emergency={item} />}
          {openTab === "location" && <EmergencyLocation emergency={item} />}
          {openTab === "help" && <EmergencyHelp emergency={item} />}
        </View>
      </View>

      {/* Fullscreen image modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBg}
            onPress={closeImageModal}
            activeOpacity={1}
          />
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={closeImageModal}
              style={styles.modalCloseBtn}
              accessibilityLabel="Fechar visualização da imagem"
            >
              <Feather name="x" size={22} color="#fff" />
            </TouchableOpacity>

            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentOffset={{ x: modalImageIndex * window.width, y: 0 }}
              style={{ width: window.width }}
            >
              {images.map((uri, i) => (
                <View
                  key={String(i)}
                  style={[styles.modalImageWrap, { width: window.width }]}
                >
                  <Image
                    source={{ uri: normalizeSrc(uri) }}
                    style={[styles.modalImage, { width: window.width - 32 }]}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// small helper used in place above for quick simulated alert (keeps UX non-blocking)
function showTemporaryAlert(title: string, message: string) {
  if (Platform.OS === "web") {
    // quick, non-blocking notification for web (fallback)
    // eslint-disable-next-line no-alert
    alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

const styles = StyleSheet.create({
  // card container
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 18,
    marginHorizontal: CARD_HORIZONTAL_MARGIN,
    borderWidth: 1,
    borderColor: "#eef2f7",
    shadowColor: "#000",
    shadowOpacity: Platform.OS === "ios" ? 0.06 : 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  // share banner (feedback)
  shareBanner: {
    position: "absolute",
    left: CARD_HORIZONTAL_MARGIN,
    right: CARD_HORIZONTAL_MARGIN,
    top: -10,
    zIndex: 30,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  shareBannerSuccess: {
    backgroundColor: "#ecfdf5",
    borderColor: "#bbf7d0",
    borderWidth: 1,
  },
  shareBannerError: {
    backgroundColor: "#fff1f2",
    borderColor: "#fecaca",
    borderWidth: 1,
  },
  shareBannerInfo: {
    backgroundColor: "#eff6ff",
    borderColor: "#dbeafe",
    borderWidth: 1,
  },
  shareBannerText: { color: "#0b1220", fontWeight: "700" },

  content: { flex: 1, padding: 14, paddingTop: 20 }, // added paddingTop to leave space for banner
  rowTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  titleBlock: { flex: 1, flexDirection: "row", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "800", color: "#0b1220", flexShrink: 1 },
  subtitle: { marginTop: 6, fontSize: 14, color: "#475569" },
  time: { marginTop: 6, fontSize: 12, color: "#9aa3b2" },

  // severity badge (discrete)
  badge: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    marginTop: Platform.OS === "android" ? 2 : 0,
  },
  badgeDot: { width: 10, height: 10, borderRadius: 6, marginRight: 6 },
  badgeText: {
    fontSize: 12,
    color: "#0b1220",
    fontWeight: "700",
    opacity: 0.85,
  },

  actionIcons: { flexDirection: "row", marginLeft: 12, alignItems: "center" },
  iconBtn: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  // thumbnail
  thumbnailWrap: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  thumbInner: {
    width: 160,
    height: 100,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnail: { width: "100%", height: "100%" },
  thumbLoader: { position: "absolute", zIndex: 2 },
  thumbFallback: {
    position: "absolute",
    zIndex: 3,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 6,
  },
  thumbFallbackText: { color: "#fff", fontSize: 12 },

  // Carousel multi
  carouselOuter: {
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    height: 220,
  },
  imageWrap: { height: 220, alignItems: "center", justifyContent: "center" },
  image: { height: 220, borderRadius: 10 },
  dotsWrap: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.18)",
    marginHorizontal: 6,
  },
  dotActive: {
    backgroundColor: "#111827",
    transform: [{ scale: 1.05 }],
  },

  // tabs
  tabRow: {
    flexDirection: "row",
    marginTop: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    position: "relative",
  },
  tabText: { fontSize: 14, fontWeight: "700", color: "#64748b" },
  tabTextActive: { color: "#0b5fff" },
  underline: {
    position: "absolute",
    bottom: 0,
    height: 3,
    width: "60%",
    backgroundColor: "#0b5fff",
    borderRadius: 2,
  },

  // modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBg: { ...StyleSheet.absoluteFillObject },
  modalContent: {
    width: "100%",
    maxHeight: "92%",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseBtn: {
    position: "absolute",
    top: 36,
    right: 18,
    zIndex: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 8,
    borderRadius: 8,
  },
  modalImageWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  modalImage: { height: "80%", maxHeight: 900, borderRadius: 8 },
});
