// src/components/OrganizationDetails.tsx
import React from "react";
import { View, Text, Image, StyleSheet, FlatList } from "react-native";
import { colors } from "../theme/colors";

type Centro = { id_centro: number; nome_centro: string; descricao?: string; thumbnail?: string; endereco?: string };
type Organizacao = { id_organizacao: number; nome_organizacao: string; descricao?: string; thumbnail?: string; centros?: Centro[] };

export default function OrganizationDetails({ organization }: { organization: Organizacao }) {
  return (
    <View style={styles.wrap}>
      {organization.thumbnail ? <Image source={{ uri: organization.thumbnail }} style={styles.thumb} /> : null}

      <Text style={styles.title}>{organization.nome_organizacao}</Text>
      <Text style={styles.desc}>{organization.descricao}</Text>

      <Text style={styles.section}>Centros</Text>
      <FlatList
        data={organization.centros ?? []}
        keyExtractor={(c) => `c:${c.id_centro}`}
        renderItem={({ item }) => (
          <View style={styles.centerItem}>
            <Text style={styles.centerName}>{item.nome_centro}</Text>
            <Text style={styles.centerSmall}>{item.endereco ?? "—"}</Text>
          </View>
        )}
        ListEmptyComponent={() => <Text style={styles.empty}>Nenhum centro</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 14 },
  thumb: { width: "100%", height: 160, borderRadius: 10, marginBottom: 10 },
  title: { fontWeight: "800", fontSize: 18, color: "#111" },
  desc: { color: "#555", marginTop: 8 },
  section: { marginTop: 12, fontWeight: "800", color: "#111" },
  centerItem: { paddingVertical: 8, borderBottomColor: "#EEE", borderBottomWidth: 1 },
  centerName: { fontWeight: "700" },
  centerSmall: { color: "#777", marginTop: 4 },
  empty: { color: "#777", padding: 8 },
});
