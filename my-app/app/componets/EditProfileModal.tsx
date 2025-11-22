"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  Platform,
  Alert,
} from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import api from "@/services/api";
import { useAuth } from "@/context/auth.context";

export type ProfileData = {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string | null;
  bio?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };
  organizations?: {
    id: string;
    name: string;
    description: string;
    image: string;
    created_at: string;
    updated_at: string;
  }[];
};

// Resolve URL para preview (blob:, content:, file:, data:, http(s), relativo)
function resolveUri(u?: string | null): string | null {
  if (!u || typeof u !== "string" || u.trim() === "") return null;
  if (u.startsWith("blob:")) return u;
  if (u.startsWith("content:")) return u;
  if (u.startsWith("file:") || u.startsWith("data:")) return u;
  if (/^https?:\/\//.test(u)) return u;
  if (u.startsWith("/")) return `http://localhost:3001${u}`;
  return `http://localhost:3001/${u.replace(/^\/+/, "")}`;
}
function isLocalUri(u?: string | null) {
  return !!u && (u.startsWith("blob:") || u.startsWith("content:") || u.startsWith("file:")
    || u.startsWith("data:"));
}

// Upload do avatar usando FormData no estilo do ProfilePage.tsx
async function uploadAvatar(uri: string, mime?: string): Promise<string> {
  const name = uri.split("/").pop() || `avatar-${Date.now()}.jpg`;
  const ext = (name.split(".").pop() || "jpg").toLowerCase();
  const type = mime || (ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg");

  const formData = new FormData();
  formData.append("file", { uri, name, type } as any);

  const res = await api.post("/api/v1/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  const data = res.data ?? {};
  if (typeof data === "string") return data;
  if (data.url) return data.url;
  if (data.path) return data.path;
  if (data.fileId) return `/api/v1/files/${data.fileId}`;
  if (data.file?._id) return `/api/v1/files/${data.file._id}`;
  if (data._id) return `/api/v1/files/${data._id}`;
  throw new Error("Resposta de upload inválida");
}

// Extensão para compatibilidade com o base URL do backend
function getApiBase() {
  // @ts-ignore
  const base = api?.defaults?.baseURL || "http://localhost:3001";
  return String(base).replace(/\/+$/, "");
}

type Props = {
  open: boolean;
  center?: any; // Centro a editar (não é usado no escopo deste patch, mantido para compat)
  onClose: () => void;
  onUpdate?: (updated: any) => void;
};

export default function EditProfileModal({
  open,
  center,
  onClose,
  onUpdate,
}: Props) {
  // usa o user do auth context (sem depender de center)
  const { user, updateUser } = useAuth();

  // Campos básicos do perfil
  const [name, setName] = useState<string>(user?.name ?? user?.username ?? "");
  const [email, setEmail] = useState<string>(user?.email ?? "");
  const [phone, setPhone] = useState<string>((user as any)?.telefone ?? "");
  const [bio, setBio] = useState<string>((user as any)?.bio ?? "");

  // Avatar
  const [avatar, setAvatar] = useState<string | null | undefined>(
    (user as any)?.image ?? null
  );
  const [avatarFileUri, setAvatarFileUri] = useState<string | null>(null);
  const [avatarMime, setAvatarMime] = useState<string | undefined>(undefined);
  const [avatarRemoved, setAvatarRemoved] = useState(false);

  // Endereço (opcional para UI)
  const [street, setStreet] = useState<string>((user as any)?.address?.street ?? "");
  const [number, setNumber] = useState<string>((user as any)?.address?.number ?? "");
  const [complement, setComplement] = useState<string>((user as any)?.address?.complement ?? "");
  const [neighborhood, setNeighborhood] = useState<string>((user as any)?.address?.neighborhood ?? "");
  const [city, setCity] = useState<string>((user as any)?.address?.city ?? "");
  const [stateField, setStateField] = useState<string>((user as any)?.address?.state ?? "");
  const [country, setCountry] = useState<string>((user as any)?.address?.country ?? "");
  const [zip, setZip] = useState<string>((user as any)?.address?.zip ?? "");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset ao abrir
  useEffect(() => {
    if (!open) return;
    // carrega dados atuais
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setPhone((user as any)?.telefone ?? "");
    setBio((user as any)?.bio ?? "");
    setAvatar((user as any)?.image ?? null);
    setAvatarFileUri(null);
    setAvatarMime(undefined);
    setAvatarRemoved(false);

    setStreet((user as any)?.address?.street ?? "");
    setNumber((user as any)?.address?.number ?? "");
    setComplement((user as any)?.address?.complement ?? "");
    setNeighborhood((user as any)?.address?.neighborhood ?? "");
    setCity((user as any)?.address?.city ?? "");
    setStateField((user as any)?.address?.state ?? "");
    setCountry((user as any)?.address?.country ?? "");
    setZip((user as any)?.address?.zip ?? "");
  }, [open]);

  // Avatar picker: galerias/câmera
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const triggerAvatarPicker = () => {
    fileInputRef.current?.click();
  };

  // onAvatarSelect (File input)
  const onAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    const MAX = 8 * 1024 * 1024;
    if (f.size > MAX) {
      // manter consistência com ProfilePage: erro na UI
      alert("Arquivo muito grande. Máx 8MB.");
      e.currentTarget.value = "";
      return;
    }
    // atualiza avatar para preview
    const url = URL.createObjectURL(f);
    setAvatar(url);
    setAvatarFileUri(url);
    setAvatarMime(f.type);
    setAvatarRemoved(false);
  };

  // Remover avatar
  const handleRemoveAvatar = () => {
    // confirma
    if (avatar === null) {
      // já removido
      return;
    }
    // sinaliza remoção
    setAvatar(null);
    setAvatarFileUri(null);
    setAvatarMime(undefined);
    setAvatarRemoved(true);
  };

  // Upload do avatar no estilo ProfilePage (FormData multipart)
  async function uploadAvatarUri(uri: string, mime?: string): Promise<string> {
    // similar ao ProfilePage: usa FormData com fieldName "file"
    const name = uri.split("/").pop() || `avatar-${Date.now()}.jpg`;
    const ext = (name.split(".").pop() || "jpg").toLowerCase();
    const type = mime || (ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg");

    const formData = new FormData();
    formData.append("file", { uri, name, type } as any);

    const res = await api.post("/api/v1/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const data = res.data ?? {};
    if (typeof data === "string") return data;
    if (data.url) return data.url;
    if (data.path) return data.path;
    if (data.fileId) return `/api/v1/files/${data.fileId}`;
    if (data.file?._id) return `/api/v1/files/${data.file._id}`;
    if (data._id) return `/api/v1/files/${data._id}`;
    throw new Error("Resposta de upload inválida");
  }

  // salvar (envia nome/email/telefone e imagem)
  async function handleSave() {
    if (saving) return;
    if (!user?._id) {
      Alert.alert("Erro", "Usuário não identificado.");
      return;
    }
    if (!name.trim()) {
      Alert.alert("Validação", "Nome é obrigatório.");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Validação", "Email é obrigatório.");
      return;
    }

    try {
      setSaving(true);

      // decide imagem a enviar
      let imageField: string | null | undefined = undefined;
      if (avatarRemoved && !avatar) {
        imageField = null; // remover
      } else if (avatarFileUri && isLocalUri(avatarFileUri)) {
        imageField = await uploadAvatarUri(avatarFileUri, avatarMime);
      } else {
        imageField = undefined; // não envia
      }

      const payload: any = {
        nome: name.trim(),
        email: email.trim(),
        telefone: (phone ?? "").toString().trim() || undefined,
        bio: bio?.trim() ?? undefined,
      };
      if (imageField !== undefined) payload.image = imageField;

      const res = await api.put(`/api/v1/usuarios/usuarios/${user._id}`, payload);
      const data = res.data ?? {};

      // atualiza o contexto
      updateUser({
        ...user,
        username: data.nome ?? name,
        email: data.email ?? email,
        telefone: data.telefone ?? phone,
        image:
          data.avatarUrl !== undefined
            ? data.avatarUrl
            : imageField !== undefined
            ? imageField
            : (user as any).image,
      });

      // atualiza UI local opcional
      onSave?.({
        _id: user._id,
        name: data.nome ?? name,
        email: data.email ?? email,
        phone: data.telefone ?? phone,
        avatar:
          data.avatarUrl !== undefined
            ? data.avatarUrl
            : imageField !== undefined
            ? imageField
            : (user as any).image,
      });

      onClose();
    } catch (err: any) {
      console.error("Erro ao salvar perfil:", err?.response?.data || err?.message || err);
      Alert.alert(
        "Erro",
        err?.response?.data?.message || err?.message || "Não foi possível salvar o perfil.",
      );
    } finally {
      setSaving(false);
    }
  }
  // helper: import dinâmico (evita crash quando o pacote não está instalado)
  const loadImagePicker = async () => {
    try {
      const ImagePicker = await import("expo-image-picker");
      return ImagePicker;
    } catch {
      Alert.alert(
        "Módulo ausente",
        "O recurso de foto requer 'expo-image-picker'. Execute: expo install expo-image-picker"
      );
      return null;
    }
  };

  // helper: pedir permissões (galeria e câmera)
  const requestPermissions = async (ImagePicker: any) => {
    try {
      if (Platform.OS !== "web") {
        if (ImagePicker?.requestMediaLibraryPermissionsAsync) {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert(
              "Permissão necessária",
              "Precisamos de acesso à galeria/câmera para escolher uma foto."
            );
            return false;
          }
        }
        if (ImagePicker?.requestCameraPermissionsAsync) {
          await ImagePicker.requestCameraPermissionsAsync();
        }
      }
      return true;
    } catch (e) {
      console.warn("Permissão erro:", e);
      return false;
    }
  };

  // tirar foto com a câmera
  const takePhoto = async () => {
    const ImagePicker = await loadImagePicker();
    if (!ImagePicker) return;
    const ok = await requestPermissions(ImagePicker);
    if (!ok) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      // SDKs mais novos retornam 'canceled'
      if ("canceled" in result) {
        if (result.canceled) return;
        const asset = result.assets?.[0];
        const uri = asset?.uri;
        if (uri) {
          setAvatar(uri);
          setAvatarFileUri(uri);
          setAvatarMime(asset?.mimeType);
          setAvatarRemoved(false);
        }
        return;
      }

      // fallback compat
      const asset = (result as any).assets?.[0];
      const uri = asset?.uri ?? (result as any).uri ?? null;
      if (uri) {
        setAvatar(uri);
        setAvatarFileUri(uri);
        setAvatarMime(asset?.mimeType);
        setAvatarRemoved(false);
      }
    } catch (err) {
      console.warn("Erro ao tirar foto:", err);
      Alert.alert("Erro", "Não foi possível tirar a foto.");
    }
  };

  // Render
  const previewUri = resolveUri(avatar);

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.centeredOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            <TouchableOpacity onPress={onClose} aria-label="Fechar editar perfil">
              <AntDesign name="close" size={18} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContentInner}>
            <View style={styles.avatarRow}>
              <View style={styles.avatarWrapper}>
                {previewUri ? (
                  <Image source={{ uri: previewUri }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Feather name="user" size={36} color="#aaa" />
                  </View>
                )}
              </View>

              <View style={styles.avatarActions}>
                <TouchableOpacity style={styles.avatarBtn} onPress={triggerAvatarPicker} disabled={saving}>
                  <Feather name="image" size={16} color="#007aff" />
                  <Text style={styles.avatarBtnText}>Selecionar imagem</Text>
                </TouchableOpacity>

                <input ref={fileInputRef} type="file" accept="image/*" onChange={onAvatarSelect} style={{ display: "none" }} />

                <TouchableOpacity style={styles.avatarBtn} onPress={takePhoto} disabled={saving}>
                  <Feather name="camera" size={16} color="#007aff" />
                  <Text style={styles.avatarBtnText}>Câmera</Text>
                </TouchableOpacity>

                {avatar || avatarRemoved ? (
                  <TouchableOpacity
                    style={[styles.avatarBtn, { marginTop: 8 }]}
                    onPress={handleRemoveAvatar}
                    disabled={saving}
                  >
                    <Feather name="trash-2" size={16} color="red" />
                    <Text style={[styles.avatarBtnText, { color: "red" }]}>
                      Remover
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <Text style={styles.label}>Nome</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Seu nome" editable={!saving} />

            <Text style={[styles.label, { marginTop: 12 }]}>Email</Text>
            <TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" editable={!saving} />

            <Text style={[styles.label, { marginTop: 12 }]}>Telefone</Text>
            <TextInput value={phone} onChangeText={setPhone} style={styles.input} placeholder="+55 (xx) x xxxx-xxxx" keyboardType="phone-pad" editable={!saving} />

            <Text style={[styles.sectionTitle, { marginTop: 14 }]}>Bio</Text>
            <TextInput value={bio} onChangeText={setBio} style={styles.input} placeholder="Fale sobre você" editable={!saving} />

            <View style={{ height: 12 }} />

            <View style={styles.separator} />

            <Text style={styles.label}>Endereço</Text>
            <TextInput value={street} onChangeText={setStreet} style={styles.input} placeholder="Rua / Avenida" editable={!saving} />
            <TextInput value={number} onChangeText={setNumber} style={styles.input} placeholder="Número" editable={!saving} />
            <TextInput value={complement} onChangeText={setComplement} style={styles.input} placeholder="Complemento" editable={!saving} />
            <TextInput value={neighborhood} onChangeText={setNeighborhood} style={styles.input} placeholder="Bairro" editable={!saving} />
            <TextInput value={city} onChangeText={setCity} style={styles.input} placeholder="Cidade" editable={!saving} />
            <TextInput value={stateField} onChangeText={setStateField} style={styles.input} placeholder="Estado" editable={!saving} />
            <TextInput value={country} onChangeText={setCountry} style={styles.input} placeholder="País" editable={!saving} />
            <TextInput value={zip} onChangeText={setZip} style={styles.input} placeholder="CEP" keyboardType="numeric" editable={!saving} />

            <View style={{ height: 16 }} />

            <View style={styles.modalButtonsRow}>
              <button type="button" onClick={onClose} style={styles.btnSecondary as any} disabled={saving}>
                <span style={styles.btnTextSecondary}>Cancelar</span>
              </button>
              <button type="button" onClick={handleSave} style={styles.btnPrimary as any} disabled={saving}>
                <span style={styles.btnTextPrimary}>{saving ? "Salvando..." : "Salvar"}</span>
              </button>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // ... mantenha aqui os estilos OCULTOS iguais aos anteriores
  centeredOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.25)" },
  modalBox: { width: "92%", maxHeight: "90%", backgroundColor: "#fff", borderRadius: 12, padding: 14 },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  modalTitle: { fontWeight: "700", fontSize: 16, color: "#222" },
  modalContentInner: { paddingBottom: 20 },
  avatarRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatarWrapper: { width: 86, height: 86, borderRadius: 44, overflow: "hidden", backgroundColor: "#f2f2f2", justifyContent: "center", alignItems: "center" },
  avatar: { width: "100%", height: "100%" },
  avatarPlaceholder: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center" },
  avatarActions: { marginLeft: 12, flex: 1, justifyContent: "center" },
  avatarBtn: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  avatarBtnText: { marginLeft: 8, color: "#007aff", fontWeight: "600" },
  label: { fontSize: 13, color: "#444", marginBottom: 6 },
  input: { height: 44, borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 8, paddingHorizontal: 12, backgroundColor: "#fafafa" },
  separator: { height: 1, backgroundColor: "#eee", marginVertical: 12 },
  modalButtonsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 12 },
  btnSecondary: { backgroundColor: "#f2f2f2" },
  btnPrimary: { backgroundColor: "#007aff" },
  btnTextSecondary: { color: "#333", fontWeight: "700" },
  btnTextPrimary: { color: "#fff", fontWeight: "700" },
});
