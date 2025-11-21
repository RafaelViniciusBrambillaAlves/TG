import React, { useRef, useState } from "react";
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
} from "react-native";
import { Feather } from "@expo/vector-icons";
import EmergencyDetails from "./EmergencyDetails";
import EmergencyHelp from "./EmergencyHelp";
import EmergencyLocation from "./EmergencyLocation";

export type EmergencyType = {
  id: number;
  titulo: string;
  subtitulo?: string;
  descricao?: string;
  timeLabel?: string;
  severity?: "warning" | "danger" | "info";
  image?: string;
  images?: string[];
  id_endereco?: number | null;
  centros: any;
};

type Props = { item: EmergencyType };
type SubTab = "details" | "location" | "help" | null;

const SCREEN_PADDING = 16;
const CARD_HORIZONTAL_MARGIN = 16;
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function EmergencyCard({ item }: Props) {
  const [openTab, setOpenTab] = useState<SubTab>(null);

  // carousel state
  const scrollRef = useRef<ScrollView | null>(null);
  const [carouselWidth, setCarouselWidth] = useState<number>(
    SCREEN_WIDTH - CARD_HORIZONTAL_MARGIN * 2,
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const images =
    item.images && item.images.length > 0
      ? item.images
      : item.image
        ? [item.image]
        : [];

  const severityColor =
    item.severity === "danger"
      ? "#D23B3B"
      : item.severity === "warning"
        ? "#F1C40F"
        : "#3B82F6";

  const toggleTab = (tab: Exclude<SubTab, null>) => {
    setOpenTab((prev) => (prev === tab ? null : tab));
  };

  const onLayoutCarousel = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w && w !== carouselWidth) {
      setCarouselWidth(w);
      // ensure current index is visible after resize
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

  const renderCarousel = () => {
    if (!images.length) return null;
    return (
      <View style={styles.carouselOuter} onLayout={onLayoutCarousel}>
        <ScrollView
          ref={(r) => (scrollRef.current = r)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{}}
        >
          {images.map((uri, i) => (
            <View
              key={String(i)}
              style={[styles.imageWrap, { width: carouselWidth }]}
            >
              <Image
                source={{ uri }}
                style={[styles.image, { width: carouselWidth }]}
                resizeMode="cover"
              />
            </View>
          ))}
        </ScrollView>

        {images.length > 1 && (
          <View style={styles.dotsWrap} pointerEvents="box-none">
            {images.map((_, i) => (
              <Pressable
                key={String(i)}
                onPress={() => goToIndex(i)}
                style={[styles.dot, activeIndex === i && styles.dotActive]}
                accessibilityLabel={`Página ${i + 1}`}
                android_ripple={{ color: "rgba(0,0,0,0.08)", radius: 12 }}
              />
            ))}
          </View>
        )}
      </View>
    );
  };
  console.log(item)
  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: severityColor }]} />

      <View style={styles.content}>
        <View style={styles.rowTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={2}>
              {item.titulo}
            </Text>
            {item.subtitulo ? (
              <Text style={styles.subtitle}>{item.subtitulo}</Text>
            ) : null}
            {item.timeLabel ? (
              <Text style={styles.time}>{item.timeLabel}</Text>
            ) : null}
          </View>

          <View style={styles.actionIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              accessibilityLabel="Salvar emergência"
            >
              <Feather name="bookmark" size={20} color="#555" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              accessibilityLabel="Compartilhar emergência"
            >
              <Feather name="share-2" size={20} color="#555" />
            </TouchableOpacity>
          </View>
        </View>
        {item.image &&
          <Image
            source={{ uri: `http://localhost:3001${item.image}` }}
            style={[styles.image]}
          />
        }

        {/*{renderCarousel()}*/}

        <View style={styles.tabRow}>
          <TouchableOpacity
            onPress={() => toggleTab("details")}
            style={styles.tabBtn}
            activeOpacity={0.8}
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

        {openTab === "details" && <EmergencyDetails emergency={item} />}
        {openTab === "location" && <EmergencyLocation emergency={item} />}
        {openTab === "help" && <EmergencyHelp emergency={item} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 18,
    marginHorizontal: CARD_HORIZONTAL_MARGIN,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  accent: { width: 6 },
  content: { flex: 1, padding: 14 },
  rowTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  title: { fontSize: 18, fontWeight: "800", color: "#0b1220" },
  subtitle: { marginTop: 4, fontSize: 14, color: "#4b5563" },
  time: { marginTop: 6, fontSize: 12, color: "#9aa3b2" },
  actionIcons: { flexDirection: "row", marginLeft: 12, alignItems: "center" },
  iconBtn: { marginLeft: 10, padding: 6 },

  // Carousel
  carouselOuter: {
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
  },
  imageWrap: {
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    height: 220,
    borderRadius: 10,
  },
  dotsWrap: {
    position: "absolute",
    bottom: 8,
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
    backgroundColor: "rgba(255,255,255,0.6)",
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  dotActive: {
    backgroundColor: "#0b82ff",
    transform: [{ scale: 1.1 }],
    borderColor: "rgba(0,0,0,0.12)",
  },

  // tabs
  tabRow: {
    flexDirection: "row",
    marginTop: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    position: "relative",
  },
  tabText: { fontSize: 14, fontWeight: "700", color: "#788692" },
  tabTextActive: { color: "#0b82ff" },
  underline: {
    position: "absolute",
    bottom: 0,
    height: 3,
    width: "60%",
    backgroundColor: "#0b82ff",
    borderRadius: 2,
  },
});
