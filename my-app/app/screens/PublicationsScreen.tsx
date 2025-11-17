// src/screens/PublicationsScreen.tsx
import usePublications from "@/hooks/usePublications";
import React from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import PublicationCard from "../componets/PublicationCard";
import ScreenWrapper from "../componets/ScreenWrapper";

export default function PublicationsScreen() {
  const { data, loading, error, refresh } = usePublications();

  return (
    <ScreenWrapper>
      {loading && <Text style={styles.info}>Carregando publicações...</Text>}
      {error && <Text style={[styles.info, { color: "#f66" }]}>{error}</Text>}

      <FlatList
        data={data ?? []}
        keyExtractor={(p) => String(p.id_postagem)}
        renderItem={({ item }) => <PublicationCard publication={item} />}
        contentContainerStyle={{ paddingVertical: 12 }}
        refreshing={!!loading}
        onRefresh={refresh}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  info: { color: "#fff", paddingVertical: 12, fontSize: 14 },
});
