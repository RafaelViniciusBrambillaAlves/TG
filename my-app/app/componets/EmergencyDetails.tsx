import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { EmergencyType } from "./EmergencyCard";

export default function EmergencyDetails({ emergency }: { emergency: EmergencyType }) {
  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.block}>
        <Text style={styles.heading}>Descrição</Text>
        <Text style={styles.body}>{emergency.descricao ?? "Sem descrição disponível."}</Text>
      </View>

      {/* aqui você pode adicionar campos adicionais: prioridade, contatos, recursos necessários, timestamps */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 12, paddingBottom: 24 },
  block: { marginBottom: 12 },
  heading: { fontWeight: "700", fontSize: 14, color: "#0b1220", marginBottom: 8 },
  body: { color: "#374151", lineHeight: 20, fontSize: 14 },
});
