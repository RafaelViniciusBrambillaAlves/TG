// src/components/OrganizationCard.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { Feather, AntDesign } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import CenterDetails from "./CenterDetails";
import useLinkUser from "@/hooks/useLinkUser";
import { useAuth } from "@/context/auth.context";

type Centro = {
  id_centro: number;
  nome: string;
  descricao?: string;
  image?: string;
  address?: string;
  telefone?: string;
  email?: string;
  necessidades?: any[];
  emergencias?: any[];
};

type Organizacao = {
  id_organizacao: number | string;
  nome_organizacao: string;
  descricao?: string;
  thumbnail?: string;
  email?: string | null;
  centros?: Centro[];
};

export default function OrganizationCard({
  organization,
}: {
  organization: Organizacao;
}) {
  const primary = colors.primary ?? "#3B82F6";
  const [expanded, setExpanded] = useState(false);
  const { linkUser } = useLinkUser();
  const { user } = useAuth();

  const toggleExpand = () => setExpanded(!expanded);

  const openWhatsApp = async (phone?: string | null, text?: string) => {
    if (!phone) {
      Alert.alert(
        "WhatsApp",
        "Telefone não disponível para contato via WhatsApp.",
      );
      return;
    }

    let digits = phone.replace(/\D+/g, "");
    if (digits.length <= 11) digits = `55${digits}`;
    const encodedText = text ? encodeURIComponent(text) : "";

    const nativeUrl = `whatsapp://send?phone=${digits}${encodedText ? `&text=${encodedText}` : ""}`;
    const webUrl = `https://wa.me/${digits}${encodedText ? `?text=${encodedText}` : ""}`;

    try {
      const supported = await Linking.canOpenURL(nativeUrl);
      if (supported) {
        await Linking.openURL(nativeUrl);
        return;
      }
    } catch {}
    try {
      await Linking.openURL(webUrl);
    } catch {
      Alert.alert("WhatsApp", "Não foi possível abrir o WhatsApp.");
    }
  };

  const renderCentroItem = ({ item }: { item: Centro }) => (
    <View style={styles.centerWrap}>
      <View style={styles.centerRow}>
        <View style={styles.thumbBox}>
          {item.image ? (
            <Image
              source={{ uri: `http://localhost:3001${item.image}` }}
              style={styles.centerThumb}
            />
          ) : (
            <View style={styles.centerThumbPlaceholder} />
          )}
        </View>

        <View style={styles.centerInfo}>
          <View style={styles.centerTitleRow}>
            <Text style={styles.centerTitle} numberOfLines={1}>
              {item.nome}
            </Text>

            {item.telefone && (
              <TouchableOpacity
                onPress={() =>
                  openWhatsApp(
                    item.telefone,
                    `Olá, gostaria de informações sobre o ${item.nome}.`,
                  )
                }
                style={[styles.contactIcon, { backgroundColor: primary }]}
                activeOpacity={0.85}
              >
                <Feather name="message-circle" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.centerDesc} numberOfLines={2}>
            {item.descricao}
          </Text>

          <View style={styles.centerMetaRow}>
            <Text style={styles.centerMeta} numberOfLines={1}>
              📞 {item.telefone ?? "—"}
            </Text>
          </View>
          <Text style={styles.centerMetaSmall}>✉ {item.email ?? "—"}</Text>
        </View>
      </View>

      <View style={styles.centerPanel}>
        <CenterDetails id={item.id_centro} centerProp={item} />
      </View>
    </View>
  );

  // console.log(organization); // opcional — remova em produção
  console.log(organization.centros)
  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={toggleExpand}>
        <View style={styles.headerRow}>
          <View style={styles.left}>
            {organization.thumbnail ? (
              <Image
                source={{ uri: organization.thumbnail }}
                style={styles.thumb}
              />
            ) : (
              <View style={styles.thumbPlaceholder} />
            )}
          </View>

          <View style={styles.headInfo}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View>
                <Text style={styles.title} numberOfLines={1}>
                  {organization.nome_organizacao}
                </Text>
                <Text style={styles.desc} numberOfLines={2}>
                  {organization.descricao}
                </Text>

                <View style={styles.metaRow}>
                  <Text style={styles.orgEmail} numberOfLines={1}>
                    {organization.email ?? "Email não informado"}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "column",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  onPress={async () => {
                    if (!user?._id) {
                      Alert.alert("Atenção", "Usuário não autenticado.");
                      return;
                    }
                    await linkUser({
                      userId: user._id,
                      organizationId: String(organization.id_organizacao),
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: primary, fontWeight: "700" }}>
                    Faça parte
                  </Text>
                </TouchableOpacity>

                <AntDesign
                  name={expanded ? "up" : "down"}
                  size={18}
                  color="#475569"
                />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.centersList}>
          <Text style={styles.sectionTitle}>Centros desta organização</Text>

          <FlatList
            data={organization.centros ?? []}
            keyExtractor={(c) => `c:${c.id_centro}`}
            renderItem={renderCentroItem}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            ListEmptyComponent={() => (
              <Text style={styles.empty}>Nenhum centro encontrado.</Text>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E9EEF8",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },

  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  left: { width: 96 },
  thumb: { width: 96, height: 64, borderRadius: 8, backgroundColor: "#F6F8FB" },
  thumbPlaceholder: {
    width: 96,
    height: 64,
    borderRadius: 8,
    backgroundColor: "#F6F8FB",
  },

  headInfo: { flex: 1 },
  title: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  desc: { color: "#475569", marginTop: 6, fontSize: 13 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  orgEmail: { color: "#334155", fontSize: 13, fontWeight: "600", flex: 1 },

  centersList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
  },
  sectionTitle: { fontWeight: "800", marginBottom: 12, color: "#0F172A" },

  centerWrap: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  centerRow: { flexDirection: "row", alignItems: "flex-start" },
  thumbBox: { width: 96, alignItems: "center", justifyContent: "center" },
  centerThumb: {
    width: 84,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#F6F8FB",
  },
  centerThumbPlaceholder: {
    width: 84,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#F6F8FB",
  },

  centerInfo: { flex: 1, paddingLeft: 12 },
  centerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  centerTitle: { fontWeight: "700", color: "#0F172A", fontSize: 15 },
  contactIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  centerDesc: { color: "#475569", marginTop: 6, fontSize: 13 },
  centerMetaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    flexWrap: "wrap",
  },
  centerMeta: { color: "#64748B", fontSize: 12, maxWidth: "70%" },
  centerMetaSmall: { color: "#64748B", fontSize: 12, marginTop: 6 },

  centerPanel: {
    marginTop: 12,
    backgroundColor: "#FAFCFF",
    padding: 12,
    borderRadius: 8,
  },

  empty: { color: "#94A3B8", padding: 8, textAlign: "center" },
});
