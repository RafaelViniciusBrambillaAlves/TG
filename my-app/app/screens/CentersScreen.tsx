// src/screens/CentersScreen.tsx
import useCenters from "@/hooks/useCenters";
import React from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import CenterCard from "../componets/CenterCard";
import ScreenWrapper from "../componets/ScreenWrapper";
import { colors } from "../theme/colors";

export default function CentersScreen() {
  const { data, loading, error, refresh } = useCenters();

  return (
    <ScreenWrapper>
      {loading && <Text style={styles.info}>Carregando centros...</Text>}
      {error && <Text style={[styles.info, styles.error]}>{error}</Text>}

      <FlatList
        data={data ?? []}
        keyExtractor={(c) => String(c.id_centro)}
        renderItem={({ item }) => <CenterCard center={item} />}
        contentContainerStyle={{ paddingVertical: 12 }}
        onRefresh={refresh}
        refreshing={!!loading}
        showsVerticalScrollIndicator={false}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  info: {
    color: colors.text, // texto padrão do tema (aparece bem sobre o fundo do ScreenWrapper)
    paddingVertical: 12,
    fontSize: 14,
    textAlign: "center",
  },
  error: {
    color: colors.danger ?? "#D23B3B",
  },
});
