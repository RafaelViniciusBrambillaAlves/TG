// src/components/CenterDetails.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Linking,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useNavigation, CommonActions } from "@react-navigation/native";

type Necessidade = {
  title?: string;
  description?: string;
  type?: string;
  quantity?: string;
  status?: string;
  quantidade_necessaria?: string;
  quantidade_atingida?: string;
  interestCount?: number;
  _id?: string | number;
};

type Emergencia = {
  id_emergencia?: number;
  titulo?: string;
  descricao?: string;
  data?: string;
  endereco?: string;
};

type Centro = {
  id_centro: number;
  nome: string;
  descricao?: string;
  endereco?: string;
  telefone?: string;
  email?: string | null;
  necessidades?: Necessidade[];
  emergencias?: Emergencia[];
};

export default function CenterDetails({
  id,
  centerProp,
}: {
  id: number;
  centerProp: Centro;
}) {
  const [tab, setTab] = useState<"localizacao" | "necessidades" | "emergencias" | null>(
    "localizacao"
  );

  const navigation = useNavigation<any>();
  const primary = colors.primary ?? "#3B82F6";

  const toggleTab = (t: "localizacao" | "necessidades" | "emergencias") => {
    setTab((prev) => (prev === t ? null : t));
  };

  const openPhone = (phone?: string | null) => {
    if (!phone) return;
    const cleaned = phone.replace(/\s+/g, "");
    Linking.openURL(`tel:${cleaned}`).catch(() => {});
  };

  const openMail = (email?: string | null) => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`).catch(() => {});
  };

  const openMaps = (address?: string) => {
    if (!address) return;
    const q = encodeURIComponent(address);
    const url = Platform.OS === "ios" ? `maps:0,0?q=${q}` : `geo:0,0?q=${q}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`).catch(() => {});
    });
  };

  /**
   * handleGoToEmergency
   *
   * Comportamento desejado:
   *  - Trocar para a aba "Emergências"
   *  - Selecionar/abrir a emergência cujo id foi passado
   *
   * Estratégia:
   * 1) Tenta navegar diretamente para uma rota de detalhe (EmergencyDetail).
   * 2) Tenta navegar para a aba "Emergencias" e abrir "EmergencyDetail" dentro dela (nested).
   * 3) Tenta disparar uma navegação no parent (útil quando estamos dentro de um Stack dentro de Tabs).
   * 4) Fallback: envia param `selectedId` para a aba/lista de emergências (sua lista deve ler esse param e rolar/abrir).
   *
   * Ajuste os nomes das rotas abaixo se sua app usar nomes diferentes:
   *  - Aba de emergências: "Emergencias" (ou "Emergências", "Emergencies" etc)
   *  - Tela de detalhe: "EmergencyDetail"
   *
   * Se você me disser os nomes exatos das rotas, eu ajusto esse trecho para ficar 100% idêntico.
   */
  const handleGoToEmergency = async (emergencyId?: number | string) => {
    if (!emergencyId) {
      Alert.alert("Erro", "ID da emergência não disponível.");
      return;
    }

    // 1) tentativa direta (se existir rota global chamada 'EmergencyDetail')
    try {
      navigation.navigate("EmergencyDetail", { id: emergencyId, centerId: id });
      return;
    } catch (e) {
      // continua
    }

    // 2) tentativa: navegar para a aba 'Emergencias' e abrir 'EmergencyDetail' dentro dela
    try {
      navigation.navigate("Emergencias", {
        screen: "EmergencyDetail",
        params: { id: emergencyId, centerId: id },
      });
      return;
    } catch (e) {
      // continua
    }

    // 3) usar parent navigator (ex.: estamos dentro de um stack que foi embutido em Tabs)
    try {
      const parent = navigation.getParent?.();
      if (parent) {
        // 3a) Navegar para a aba (nome: 'Emergencias') — se sua Tab root tem outro nome, troque aqui
        parent.navigate("Emergencias", {
          // tentativa nested (Stack dentro da aba)
          screen: "EmergencyDetail",
          params: { id: emergencyId, centerId: id },
        });
        return;
      }
    } catch (e) {
      // continua
    }

    // 4) fallback: dispatch navigation action para garantir envio do param para a aba/lista
    try {
      navigation.dispatch(
        CommonActions.navigate({
          name: "Emergencias",
          params: { selectedId: emergencyId, centerId: id },
        })
      );
      return;
    } catch (e) {
      // continua
    }

    // 5) última tentativa: navegar para 'Emergencias' passando selectedId diretamente (se a lista abre detalhe via param)
    try {
      navigation.navigate("Emergencias", { selectedId: emergencyId, centerId: id });
      return;
    } catch (e) {
      console.warn("Falha ao navegar para Emergencias (todas as tentativas).", e);
    }

    Alert.alert(
      "Navegação",
      "Não foi possível abrir a emergência automaticamente. Verifique os nomes das rotas (EmergencyDetail / Emergencias / Tabs) no seu navigator."
    );
  };

  const necessidades = centerProp.necessidades ?? [];
  const emergencias = centerProp.emergencias ?? [];

  return (
    <View style={styles.wrap}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          accessibilityLabel="Aba localização"
          onPress={() => toggleTab("localizacao")}
          style={[
            styles.tabBtn,
            tab === "localizacao" && { borderColor: primary, backgroundColor: "#F1F5FF" },
          ]}
          activeOpacity={0.85}
        >
          <Feather name="map-pin" size={14} color={tab === "localizacao" ? primary : "#374151"} />
          <Text style={[styles.tabText, tab === "localizacao" && { color: primary }]}>Localização</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityLabel="Aba necessidades"
          onPress={() => toggleTab("necessidades")}
          style={[
            styles.tabBtn,
            tab === "necessidades" && { borderColor: primary, backgroundColor: "#F1F5FF" },
          ]}
          activeOpacity={0.85}
        >
          <Feather name="archive" size={14} color={tab === "necessidades" ? primary : "#374151"} />
          <Text style={[styles.tabText, tab === "necessidades" && { color: primary }]}>Necessidades</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityLabel="Aba emergências"
          onPress={() => toggleTab("emergencias")}
          style={[
            styles.tabBtn,
            tab === "emergencias" && { borderColor: primary, backgroundColor: "#F1F5FF" },
          ]}
          activeOpacity={0.85}
        >
          <Feather name="alert-triangle" size={14} color={tab === "emergencias" ? primary : "#374151"} />
          <Text style={[styles.tabText, tab === "emergencias" && { color: primary }]}>Emergências</Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo */}
      {tab !== null ? (
        <View style={styles.content}>
          {/* LOCALIZAÇÃO */}
          {tab === "localizacao" && (
            <View>
              <Text style={styles.sectionTitle}>{centerProp.nome_centro}</Text>
              {centerProp.descricao ? <Text style={styles.p}>{centerProp.descricao}</Text> : null}

              <View style={styles.row}>
                <Feather name="map" size={16} color="#64748B" />
                <Text style={styles.label}>Endereço</Text>
              </View>
              <Text style={styles.value}>{centerProp.endereco ?? "Endereço não informado"}</Text>

              <TouchableOpacity
                accessibilityLabel="Abrir no mapa"
                style={[styles.mapBtn, { borderColor: primary }]}
                onPress={() => openMaps(centerProp.endereco)}
                activeOpacity={0.85}
              >
                <Feather name="map-pin" size={14} color={primary} />
                <Text style={[styles.mapBtnText, { color: primary }]}>Abrir no mapa</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* NECESSIDADES */}
          {tab === "necessidades" && (
            <View>
              <Text style={styles.sectionTitle}>Necessidades</Text>
              {necessidades.length === 0 ? (
                <Text style={styles.empty}>Nenhuma necessidade registrada.</Text>
              ) : (
                <FlatList
                  data={necessidades}
                  keyExtractor={(n, i) => `n:${n._id ?? i}`}
                  ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                  renderItem={({ item }) => (
                    <View style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemTitle}>{item.title ?? item.type ?? "Recurso"}</Text>
                        {item.quantidade_necessaria != null ? (
                          <Text style={styles.itemQty}>{String(item.quantidade_necessaria)}</Text>
                        ) : null}
                      </View>
                      {item.description ? <Text style={styles.itemDesc}>{item.description}</Text> : null}
                      {item.interestCount ? <Text style={styles.itemDesc}>Interessados: {item.interestCount}</Text> : null}
                    </View>
                  )}
                />
              )}
            </View>
          )}

          {/* EMERGÊNCIAS (TOQUE NO ITEM NAVEGA PARA A ABA/DETALHE) */}
          {tab === "emergencias" && (
            <View>
              <Text style={styles.sectionTitle}>Emergências</Text>

              {emergencias.length === 0 ? (
                <Text style={styles.empty}>Nenhuma emergência relacionada.</Text>
              ) : (
                <FlatList
                  data={emergencias}
                  keyExtractor={(e, i) => `e:${e.id_emergencia ?? i}`}
                  ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleGoToEmergency(item.id_emergencia)}
                      activeOpacity={0.85}
                      style={styles.itemCardTouchable}
                    >
                      <View style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                          <Text style={styles.itemTitle}>{item.titulo ?? "Emergência"}</Text>
                          {item.data ? <Text style={styles.itemDate}>{item.data}</Text> : null}
                        </View>

                        {item.descricao ? <Text style={styles.itemDesc}>{item.descricao}</Text> : null}
                        {item.endereco ? <Text style={[styles.itemDesc, { marginTop: 8 }]}>📍 {item.endereco}</Text> : null}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          )}
        </View>
      ) : (
        <></>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  tabs: { flexDirection: "row", gap: 8, marginBottom: 10 },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E6EEF8",
    backgroundColor: "transparent",
  },
  tabText: { fontWeight: "700", fontSize: 13, color: "#374151" },

  content: { paddingTop: 6 },

  collapsed: { paddingVertical: 8, alignItems: "center" },
  collapsedText: { color: "#94A3B8", fontSize: 13 },

  sectionTitle: { fontWeight: "800", fontSize: 15, color: "#0F172A", marginBottom: 8 },
  p: { color: "#475569", marginBottom: 8 },

  row: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  label: { fontWeight: "700", color: "#475569" },
  value: { color: "#374151", marginTop: 4, marginBottom: 8 },
  link: { textDecorationLine: "underline", color: "#1D4ED8" },

  mapBtn: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
    backgroundColor: "#fff",
  },
  mapBtnText: { fontWeight: "700" },

  empty: { color: "#94A3B8", padding: 8 },

  itemCardTouchable: {
    borderRadius: 10,
    overflow: "hidden",
  },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemTitle: { fontWeight: "700", color: "#0F172A" },
  itemQty: { fontWeight: "800", color: "#6B7280" },
  itemDesc: { color: "#475569", marginTop: 6 },
  itemDate: { color: "#6B7280" },

  viewBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#fff",
  },
  viewBtnText: { fontWeight: "700" },

  collapsedTextSmall: { color: "#9CA3AF", fontSize: 12 },
});
