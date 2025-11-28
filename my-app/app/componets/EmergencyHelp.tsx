import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ScrollView,
} from "react-native";
import { EmergencyType } from "./EmergencyCard";

// Se tiver uma base de API/arquivos diferente, ajuste aqui:
const API_BASE = "http://localhost:3001";

// Converte "/api/v1/files/xxx" em URL absoluta para o RN
function toAbsoluteUrl(possiblyRelative?: string | null) {
  if (!possiblyRelative) return null;
  if (possiblyRelative.startsWith("http")) return possiblyRelative;
  return `${API_BASE}${possiblyRelative}`;
}

export default function EmergencyHelp({
  emergency,
}: {
  emergency: EmergencyType;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  const centros = emergency?.centros ?? [];

  const handleOpen = (c: any) => {
    setSelected(c);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  const selectedImageUrl = useMemo(() => {
    if (!selected) return null;
    // backend pode enviar "image" ou "imagem"
    const img = selected.image || selected.imagem || null;
    return toAbsoluteUrl(img);
  }, [selected]);

  return (
    <View style={styles.wrap}>
      {centros.map((c: any) => (
        <View key={c.id_centro || c.id || c.nome} style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{c.nome}</Text>

            {c.image || c.imagem ? (
              <Image
                source={{ uri: toAbsoluteUrl(c.image || c.imagem)! }}
                style={styles.centerImage}
                resizeMode="cover"
              />
            ) : null}
            {!!c.descricao && <Text style={styles.desc}>{c.descricao}</Text>}
            {!!c.email && <Text style={styles.desc}>{c.email}</Text>}

            {!!c.telefone && <Text style={styles.phone}>{c.telefone}</Text>}
          </View>

          <TouchableOpacity style={styles.cta} onPress={() => handleOpen(c)}>
            <Text style={styles.ctaText}>Ver Centro</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              {selectedImageUrl ? (
                <Image
                  source={{ uri: selectedImageUrl }}
                  style={styles.centerImageLarge}
                  resizeMode="cover"
                />
              ) : null}
              <Text style={styles.modalTitle}>
                {selected?.nome ?? "Centro"}
              </Text>

              {!!selected?.email && (
                <Text style={styles.modalLine}>Email: {selected.email}</Text>
              )}
              {!!selected?.telefone && (
                <Text style={styles.modalLine}>
                  Telefone: {selected.telefone}
                </Text>
              )}
              {!!selected?.endereco && selected.endereco.trim() !== "" && (
                <Text style={styles.modalLine}>
                  Endereço: {selected.endereco}
                </Text>
              )}
              {!!selected?.descricao && selected.descricao.trim() !== "" && (
                <Text style={styles.modalLine}>
                  Descrição: {selected.descricao}
                </Text>
              )}

              {Array.isArray(selected?.necessidades) && (
                <Text style={styles.modalLine}>
                  Necessidades: {selected.necessidades.length}
                </Text>
              )}
              {Array.isArray(selected?.emergencias) && (
                <Text style={styles.modalLine}>
                  Emergências: {selected.emergencias.length}
                </Text>
              )}

              <TouchableOpacity style={styles.modalClose} onPress={handleClose}>
                <Text style={styles.modalCloseText}>Fechar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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

  centerImage: {
    marginTop: 8,
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0b1220",
    marginBottom: 12,
  },
  modalLine: {
    color: "#374151",
    marginTop: 8,
  },
  modalClose: {
    marginTop: 16,
    backgroundColor: "#0b82ff",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCloseText: {
    color: "#fff",
    fontWeight: "700",
  },
  centerImageLarge: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#e5e7eb",
  },
});
