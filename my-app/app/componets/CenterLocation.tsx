// src/components/CenterLocation.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Endereco = {
  id_endereco?: number;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export default function CenterLocation({ endereco }: { endereco: Endereco }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>Endereço:</Text>
      <Text style={styles.addr}>
        {endereco.logradouro ?? ""} {endereco.numero ?? ""} — {endereco.bairro ?? ""}{"\n"}
        {endereco.cidade ?? ""} / {endereco.estado ?? ""} — {endereco.cep ?? ""}
      </Text>

      <View style={styles.mapPlaceholder}>
        <Text>📍 {endereco.latitude ?? "—"}, {endereco.longitude ?? "—"}</Text>
        <Text style={{ marginTop: 6, color: "#888" }}>Substitua por react-native-maps para mapa real</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  text: { color: "#fff", fontWeight: "700" },
  addr: { color: "#ddd", marginTop: 6 },
  mapPlaceholder: {
    marginTop: 10,
    height: 160,
    borderRadius: 8,
    backgroundColor: "#dcdcdc",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#444",
  },
});
