// src/screens/MapScreen.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ScreenWrapper from "../componets/ScreenWrapper";

export default function MapScreen({ emergency }: any) {
  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>📍 Mapa - localização de: {emergency.title}</Text>
        <Text style={styles.mapSub}>(Troque por react-native-maps para mapa real)</Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  mapPlaceholder: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#555",
    backgroundColor: "#e9e9e9",
    alignItems: "center",
    justifyContent: "center",
  },
  mapText: { fontWeight: "700", fontSize: 16 },
  mapSub: { marginTop: 8, color: "#555", fontSize: 12 },
});
