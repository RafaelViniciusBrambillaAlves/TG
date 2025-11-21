// src/componets/CenterNeeds.tsx
import React, { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
  GestureResponderEvent,
} from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import { colors } from "../theme/colors";

export type Necessidade = {
  id_necessidade: number;
  nome_recurso: string;
  descricao?: string;
  quantidade_necessaria?: number;
  quantidade_intencao?: number;
  tipo_voluntariado?: string | null;
  status?: string | null;
};

type Props = {
  necessidades: Necessidade[];
  onHelp?: (id_necessidade: number) => void; // callback opcional
};

export default function CenterNeeds({ necessidades, onHelp }: Props) {
  if (!necessidades || necessidades.length === 0) {
    return <Text style={styles.empty}>Nenhuma necessidade reportada.</Text>;
  }

  return (
    <View style={styles.wrap}>
      {necessidades.map((n) => (
        <NeedItem key={n.id_necessidade} need={n} onHelp={onHelp} />
      ))}
    </View>
  );
}

/* ----------------------------------------
   Componente interno por item — com botão animado
   ---------------------------------------- */
function NeedItem({
  need,
  onHelp,
}: {
  need: Necessidade;
  onHelp?: (id_necessidade: number) => void;
}) {
  // estado liked para toggle visual
  const [liked, setLiked] = useState(false);

  // animações
  const scale = useRef(new Animated.Value(1)).current; // scale do botão
  const iconScale = useRef(new Animated.Value(1)).current; // pop do ícone
  const bgAnim = useRef(new Animated.Value(0)).current; // 0 = off, 1 = on (interpolado para cores)

  // cores alvo
  const primary = colors.primary ?? "#3B82F6";
  const primaryDark = "#2563EB";

  const handlePress = (_e: GestureResponderEvent) => {
    const next = !liked;
    setLiked(next);

    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 90,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1.03,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(iconScale, {
            toValue: 1.4,
            duration: 160,
            easing: Easing.out(Easing.back(1.1)),
            useNativeDriver: true,
          }),
          Animated.timing(iconScale, {
            toValue: 1,
            duration: 160,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(bgAnim, {
          toValue: next ? 1 : 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]),
      Animated.timing(scale, {
        toValue: 1,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    if (onHelp) onHelp(need.id_necessidade);
  };

  // interpolação de cor do botão (usamos cores RGB para interpolar)
  const backgroundColorInterpolated = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [primary, primaryDark],
  });

  const borderColorInterpolated = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(59,130,246,0.9)", "rgba(37,99,235,0.95)"],
  });

  const iconColor = "#fff";

  return (
    <View style={styles.item}>
      <View style={styles.left}>
        <Text style={styles.name} numberOfLines={1}>
          {need.nome_recurso}
        </Text>
        {need.descricao ? (
          <Text style={styles.desc} numberOfLines={2}>
            {need.descricao}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Nec.: {need.quantidade_necessaria ?? "—"}</Text>
          </View>
          {need.tipo_voluntariado ? (
            <Text style={styles.metaText}>{need.tipo_voluntariado}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.right}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <AnimatedTouchable
            onPress={handlePress}
            activeOpacity={0.85}
            style={[
              styles.cta,
              {
                backgroundColor: backgroundColorInterpolated,
                borderColor: borderColorInterpolated,
              } as any,
            ]}
          >
            <Animated.View style={{ transform: [{ scale: iconScale }], flexDirection: "row", alignItems: "center" }}>
              {/* CORREÇÃO: outline com Feather (sempre disponível) + filled com AntDesign */}
              {liked ? (
                <AntDesign name="heart" size={16} color={iconColor} style={{ marginRight: 8 }} />
              ) : (
                <Feather name="heart" size={16} color={iconColor} style={{ marginRight: 8 }} />
              )}
              <Text style={styles.ctaText}>Quero Ajudar</Text>
            </Animated.View>
          </AnimatedTouchable>
        </Animated.View>
      </View>
    </View>
  );
}

// Animated TouchableOpacity wrapper
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
  },
  empty: {
    color: colors.textMuted ?? "#777",
    textAlign: "center",
    paddingVertical: 12,
  },

  item: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  left: { flex: 1, paddingRight: 8 },

  name: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "700",
  },

  desc: {
    color: "#555555",
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  badge: {
    backgroundColor: "#F3F6FF",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#E6EEFF",
  },
  badgeText: {
    color: colors.primary ?? "#3B82F6",
    fontSize: 12,
    fontWeight: "700",
  },
  metaText: {
    marginLeft: 10,
    color: colors.textMuted ?? "#888",
    fontSize: 12,
  },

  right: {
    width: 128,
    alignItems: "center",
    justifyContent: "center",
  },

  cta: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110,
    borderWidth: 1.2,
  },
  ctaText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 11,
  },
});
