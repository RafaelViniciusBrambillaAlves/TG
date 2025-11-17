// src/components/CenterEmergencies.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from "react-native";

export type Emergencia = {
  id_emergencia?: number;
  titulo?: string;
  descricao?: string;
  endereco?: string;
  createdAt?: string | number;
  imagem?: string;
  necessidades?: Array<{
    id_necessidade?: number;
    nome_recurso?: string;
    descricao?: string;
    tipo?: string; // "doacao" | "voluntariado" | "servico"
    quantidade_necessaria?: number;
    status?: string;
  }>;
};

function formatTimeLabel(createdAt?: string | number) {
  if (!createdAt) return "";
  try {
    const then = new Date(createdAt).getTime();
    const diff = Date.now() - then;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Há menos de 1h";
    if (hours < 24) return `Há ${hours}h`;
    return `Há ${Math.floor(hours / 24)}d`;
  } catch {
    return "";
  }
}

function EmergencyItem({ item }: { item: Emergencia }) {
  const [tab, setTab] = useState<"info" | "address" | "needs">("info");
  const timeLabel = formatTimeLabel(item.createdAt);

  return (
    <View style={styles.emCard}>
      <View style={styles.emHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.emTitle}>{item.titulo ?? "Emergência"}</Text>
          {item.descricao ? <Text style={styles.emDesc} numberOfLines={2}>{item.descricao}</Text> : null}
          <Text style={styles.emMeta}>{item.endereco ?? "Endereço não informado"} {timeLabel ? ` • ${timeLabel}` : ""}</Text>
        </View>

        {item.imagem ? (
          <Image source={{ uri: item.imagem }} style={styles.emImage} />
        ) : (
          <View style={styles.emImagePlaceholder} />
        )}
      </View>

      {/* sub-tabs */}
      <View style={styles.subTabRow}>
        <TouchableOpacity style={[styles.subTabBtn, tab === "info" && styles.subTabActive]} onPress={() => setTab("info")}>
          <Text style={[styles.subTabText, tab === "info" && styles.subTabTextActive]}>Informação</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.subTabBtn, tab === "address" && styles.subTabActive]} onPress={() => setTab("address")}>
          <Text style={[styles.subTabText, tab === "address" && styles.subTabTextActive]}>Endereço</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.subTabBtn, tab === "needs" && styles.subTabActive]} onPress={() => setTab("needs")}>
          <Text style={[styles.subTabText, tab === "needs" && styles.subTabTextActive]}>Necessidades</Text>
        </TouchableOpacity>
      </View>

      {/* sub-panels */}
      {tab === "info" && (
        <View style={styles.subPanel}>
          <Text style={styles.subPanelText}>{item.descricao ?? "Sem descrição adicional."}</Text>
        </View>
      )}

      {tab === "address" && (
        <View style={styles.subPanel}>
          <Text style={styles.subPanelLabel}>Endereço</Text>
          <Text>{item.endereco ?? "Não informado"}</Text>
        </View>
      )}

      {tab === "needs" && (
        <View style={styles.subPanel}>
          <Text style={styles.subPanelLabel}>Necessidades</Text>
          {item.necessidades && item.necessidades.length > 0 ? (
            <FlatList
              data={item.necessidades}
              keyExtractor={(n) => `n:${n.id_necessidade ?? Math.random()}`}
              renderItem={({ item: n }) => (
                <View style={styles.need}>
                  <Text style={styles.needTitle}>{n.nome_recurso}</Text>
                  {n.descricao ? <Text style={styles.needDesc} numberOfLines={2}>{n.descricao}</Text> : null}
                  <View style={styles.needRow}>
                    <Text style={styles.needMeta}>Tipo: {n.tipo ?? "—"}</Text>
                    <Text style={styles.needMeta}>Qtd: {n.quantidade_necessaria ?? "—"}</Text>
                    <Text style={styles.needMeta}>Status: {n.status ?? "—"}</Text>
                  </View>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            />
          ) : (
            <Text style={styles.emptyNeeds}>Nenhuma necessidade listada.</Text>
          )}
        </View>
      )}
    </View>
  );
}

export default function CenterEmergencies({ emergencies }: { emergencies: Emergencia[] }) {
  if (!emergencies || emergencies.length === 0) {
    return <Text style={styles.empty}>Nenhuma emergência associada a este centro.</Text>;
  }

  return (
    <FlatList
      data={emergencies}
      keyExtractor={(e) => `e:${e.id_emergencia ?? Math.random()}`}
      renderItem={({ item }) => <EmergencyItem item={item} />}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
    />
  );
}

const styles = StyleSheet.create({
  emCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
  },
  emHeader: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  emTitle: { fontWeight: "800", fontSize: 15, color: "#111" },
  emDesc: { color: "#555", marginTop: 6 },
  emMeta: { color: "#888", marginTop: 8, fontSize: 12 },

  emImage: { width: 92, height: 72, borderRadius: 8 },
  emImagePlaceholder: { width: 92, height: 72, borderRadius: 8, backgroundColor: "#F0F0F0" },

  subTabRow: { flexDirection: "row", marginTop: 10, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  subTabBtn: { flex: 1, alignItems: "center", paddingVertical: 10 },
  subTabText: { color: "#666", fontWeight: "700" },
  subTabActive: { backgroundColor: "#F8FAFF" },
  subTabTextActive: { color: "#1E40AF" },

  subPanel: { paddingTop: 12 },
  subPanelText: { color: "#444" },
  subPanelLabel: { fontWeight: "800", marginBottom: 6 },

  need: { backgroundColor: "#FAFAFA", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#EFEFEF" },
  needTitle: { fontWeight: "700", color: "#111" },
  needDesc: { color: "#555", marginTop: 6 },
  needRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  needMeta: { color: "#777", fontSize: 12 },

  empty: { color: "#777", padding: 8 },
  emptyNeeds: { color: "#777" },
});
