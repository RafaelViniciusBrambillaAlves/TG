import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { EmergencyType } from "./EmergencyCard";

export default function EmergencyLocation({ emergency }: { emergency: EmergencyType }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>📍 Endereço da Emergência</Text>
      <Text style={styles.address}>{emergency.address}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6E9EE",
    backgroundColor: "#FBFDFF",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0b1220",
    marginBottom: 6,
  },
  address: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
});
