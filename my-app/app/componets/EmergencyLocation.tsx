import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { EmergencyType } from "./EmergencyCard";

export default function EmergencyLocation({ emergency }: { emergency: EmergencyType }) {
  // placeholder: substitua por react-native-maps e passe coords se tiver
  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.title}>📍 {emergency.titulo}</Text>
        <Text style={styles.sub}>Aqui pode ficar um mapa interativo (react-native-maps)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 12 },
  mapPlaceholder: {
    height: 260,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6E9EE",
    backgroundColor: "#FBFDFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  title: { fontWeight: "800", color: "#0b1220", fontSize: 16 },
  sub: { marginTop: 6, color: "#6B7280" },
});
