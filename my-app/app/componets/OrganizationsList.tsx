// src/components/OrganizationsList.tsx
import React from "react";
import { FlatList, StyleSheet, View, Text } from "react-native";
import OrganizationCard from "./OrganizationCard";

type Centro = {
  id_centro: number;
  nome_centro: string;
  descricao?: string;
  thumbnail?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  necessidades?: any[]; // estrutura conforme seu CenterNeeds
  emergencias?: any[]; // estrutura conforme seu sistema
  id_organizacao?: number;
};

type Organizacao = {
  id_organizacao: number;
  nome_organizacao: string;
  descricao?: string;
  thumbnail?: string;
  centros?: Centro[];
};

type Props = {
  organizations?: Organizacao[];
};

export default function OrganizationsList({ organizations }: Props) {
  // se não vierem dados, mostramos um mock rápido — útil pra ver a UI
  const sample: Organizacao[] = organizations;

  return (
    <FlatList
      data={sample}
      keyExtractor={(item) => `org:${item.id_organizacao}`}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => <OrganizationCard organization={item} />}
      ItemSeparatorComponent={() => <View style={styles.sep} />}
      ListEmptyComponent={() => (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nenhuma organização encontrada.</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 14, paddingBottom: 30 },
  sep: { height: 10 },
  empty: { padding: 24, alignItems: "center" },
  emptyText: { color: "#777" },
});
