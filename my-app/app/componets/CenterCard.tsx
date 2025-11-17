// CenterCard.tsx
import { CenterSummary } from "@/hooks/useCenters";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, Linking, Alert } from "react-native";
import CenterDetails from "./CenterDetails";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme/colors";

type Props = { center: CenterSummary };
type SubTab = "details" | null;

export default function CenterCard({ center }: Props) {
  const [openTab, setOpenTab] = useState<SubTab>(null);

  const toggleTab = () => setOpenTab(prev => (prev === "details" ? null : "details"));

  const openWhatsApp = async (phone?: string | null, text?: string) => {
    if (!phone) {
      Alert.alert("WhatsApp", "Telefone não disponível para contato via WhatsApp.");
      return;
    }

    let digits = phone.replace(/\D+/g, "");
    if (digits.length <= 11) digits = `55${digits}`;

    const encodedText = text ? encodeURIComponent(text) : "";
    const nativeUrl = `whatsapp://send?phone=${digits}${encodedText ? `&text=${encodedText}` : ""}`;
    const webUrl = `https://wa.me/${digits}${encodedText ? `?text=${encodedText}` : ""}`;

    try {
      const supported = await Linking.canOpenURL(nativeUrl);
      if (supported) {
        await Linking.openURL(nativeUrl);
        return;
      }
    } catch {}
    try {
      await Linking.openURL(webUrl);
    } catch {
      Alert.alert("WhatsApp", "Não foi possível abrir o WhatsApp.");
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {center.thumbnail && <Image source={{ uri: center.thumbnail }} style={styles.thumb} />}
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{center.nome_centro}</Text>
            <TouchableOpacity
              style={styles.whatsappBtn}
              onPress={() =>
                openWhatsApp(
                  center.telefone,
                  `Olá, gostaria de informações sobre o ${center.nome_centro}.`
                )
              }
            >
              <Feather name="message-circle" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.desc} numberOfLines={2}>{center.descricao}</Text>
          <Text style={styles.phone}>Telefone: {center.telefone}</Text>

          <View style={styles.tabRow}>
            <TouchableOpacity onPress={toggleTab} style={styles.tabBtn}>
              <Text style={[styles.tabText, openTab === "details" && styles.tabTextActive]}>
                {openTab === "details" ? "Fechar Detalhes" : "Ver Detalhes"}
              </Text>
              {openTab === "details" && <View style={styles.underline} />}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {openTab === "details" && <CenterDetails id={center.id_centro} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    padding: 14,
  },
  row: { flexDirection: "row" },
  thumb: { width: 120, height: 80, borderRadius: 10 },
  info: { flex: 1, paddingLeft: 12 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 16, fontWeight: "700", color: "#111" },
  whatsappBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#25D366",
    alignItems: "center",
    justifyContent: "center",
  },
  desc: { color: "#555", marginTop: 4 },
  phone: { color: "#999", marginTop: 4, fontSize: 13 },
  tabRow: { flexDirection: "row", marginTop: 12, borderBottomWidth: 1, borderBottomColor: "#EEE" },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 10 },
  tabText: { fontSize: 14, fontWeight: "600", color: "#888" },
  tabTextActive: { color: "#3B82F6", fontWeight: "700" },
  underline: { position: "absolute", bottom: 0, height: 2, width: "60%", backgroundColor: "#3B82F6", borderRadius: 1 },
});
