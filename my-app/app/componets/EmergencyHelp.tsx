import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { EmergencyType } from "./EmergencyCard";

type Center = { id: number; name: string; phone?: string; desc?: string };

const MOCK_CENTERS: Center[] = [
  {
    id: 1,
    name: "Centro Navegantes",
    phone: "(51) 3345-8721",
    desc: "Acolhimento geral",
  },
  {
    id: 2,
    name: "Ginásio Restinga",
    phone: "(51) 3267-4450",
    desc: "Alojamento coletivo",
  },
];

export default function EmergencyHelp({
  emergency,
}: {
  emergency: EmergencyType;
}) {
  return (
    <View style={styles.wrap}>
      {emergency.centros.map((c) => (
        <View key={c.id} style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{c.nome_centro}</Text>
            <Text style={styles.desc}>{c.descricao}</Text>
            {c.telefone ? <Text style={styles.phone}>{c.telefone}</Text> : null}
          </View>

          <TouchableOpacity
            style={styles.cta}
            onPress={() => {
              /* TODO: navegar para centro */
            }}
          >
            <Text style={styles.ctaText}>Ver Centro</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 12, paddingBottom: 12 },
  card: {
    backgroundColor: "#FAFBFF",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EAEEF6",
  },
  title: { fontWeight: "800", color: "#0b1220" },
  desc: { color: "#475569", marginTop: 6 },
  phone: { color: "#6B7280", marginTop: 6, fontSize: 13 },
  cta: {
    backgroundColor: "#0b82ff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  ctaText: { color: "#fff", fontWeight: "700" },
});
