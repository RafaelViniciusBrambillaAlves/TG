// src/screens/DetailsScreen.tsx
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ScreenWrapper from "../componets/ScreenWrapper";

export default function DetailsScreen({ emergency, onOpenMap }: any) {
  return (
    <ScreenWrapper>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{emergency.title}</Text>
        <Text style={styles.time}>{emergency.time}</Text>
      </View>

      <Text style={styles.summary}>{emergency.summary}</Text>

      {emergency.image && <Image source={{ uri: emergency.image }} style={styles.image} />}

      <Text style={styles.body}>{emergency.content ?? "Detalhes completos da emergência..."}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnPrimary}><Text style={styles.btnText}>Ver Detalhes</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btn}><Text style={styles.btnTextSecondary}>Localização</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btn}><Text style={styles.btnTextSecondary}>Quero ajudar</Text></TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.mapBtn} onPress={onOpenMap}>
        <Text style={styles.mapBtnText}>Abrir mapa</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { color: "#fff", fontSize: 20, fontWeight: "800" },
  time: { color: "#bbb", fontSize: 12 },
  summary: { color: "#ddd", marginBottom: 12, fontSize: 14 },
  image: { width: "100%", height: 200, borderRadius: 12, marginBottom: 12 },
  body: { color: "#e3e3e3", marginBottom: 16, lineHeight: 20, fontSize: 14 },
  actions: { flexDirection: "row", marginBottom: 16 },
  btnPrimary: { backgroundColor: "#3b82f6", padding: 12, borderRadius: 10 },
  btn: { padding: 12, borderRadius: 10, marginLeft: 10, borderWidth: 1, borderColor: "#555" },
  btnText: { color: "#fff", fontWeight: "700" },
  btnTextSecondary: { color: "#ccc", fontWeight: "600" },
  mapBtn: { alignSelf: "center", padding: 12 },
  mapBtnText: { color: "#3b82f6", fontWeight: "700" },
});
