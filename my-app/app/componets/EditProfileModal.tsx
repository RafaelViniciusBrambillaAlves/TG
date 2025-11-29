"use client";

import React, { useEffect, useState } from "react";
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
import * as FileSystem from "expo-file-system";

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

// Resolve para preview (blob:, content://, file://, data:, http(s), relativo)
function resolveUri(u?: string | null): string | null {
  if (!u || typeof u !== "string" || u.trim() === "") return null;
  if (u.startsWith("blob:")) return u;
  if (u.startsWith("content:")) return u;
  if (u.startsWith("file:") || u.startsWith("data:")) return u;
  if (/^https?:\/\//.test(u)) return u;
  if (u.startsWith("/")) return `${process.env.EXPO_PUBLIC_API_URL}${u}`;
  return `${process.env.EXPO_PUBLIC_API_URL}${u.replace(/^\/+/, "")}`;
}
function isLocalUri(u?: string | null) {
  return (
    !!u &&
    (u.startsWith("blob:") ||
      u.startsWith("content:") ||
      u.startsWith("file:") ||
      u.startsWith("data:"))
  );
}

// base URL do backend a partir do axios instance
function getApiBase() {
  // @ts-ignore
  const base = api?.defaults?.baseURL || process.env.EXPO_PUBLIC_API_URL;
  return String(base).replace(/\/+$/, "");
}

// Upload 100% compatível com multer(memoryStorage):
// - Em ambiente nativo (Android/iOS), usa expo-file-system uploadAsync com multipart
//   sem setar manualmente Content-Type (o SDK adiciona boundary corretamente).
// - Em web (caso compile para web), usa FormData + axios com "file" como Blob.
async function uploadAvatar(
  uri: string,
  mime?: string,
  fileNameHint?: string,
): Promise<string> {
  const uploadUrl = `${getApiBase()}/api/v1/upload`;

  if (Platform.OS === "web") {
    // Web: pegue o blob da URI e envie como File (igual ao ProfilePage.tsx)
    const resp = await fetch(uri);
    const blob = await resp.blob();
    const name =
      fileNameHint || uri.split("/").pop() || `avatar-${Date.now()}.jpg`;
    const file = new File([blob], name, {
      type: blob.type || mime || "image/jpeg",
    });

    const formData = new FormData();
    formData.append("file", file);

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
    throw new Error("Resposta de upload inválida (web)");
  }

  // Nativo (Android/iOS): expo-file-system (NÃO setar Content-Type manualmente!)
  const result = await FileSystem.uploadAsync(uploadUrl, uri, {
    httpMethod: "POST",
    fieldName: "file", // nome do campo que o multer espera
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    // headers: NÃO definir Content-Type aqui, o SDK define boundary corretamente
    parameters: {}, // caso queira enviar algo mais no corpo
  });

  if (result.status !== 200) {
    throw new Error(`Upload falhou (${result.status}): ${result.body || ""}`);
  }
  let data: any = {};
  try {
    data = JSON.parse(result.body);
  } catch {
    data = result.body;
  }
  if (typeof data === "string") return data;
  if (data.url) return data.url;
  if (data.path) return data.path;
  if (data.fileId) return `/api/v1/files/${data.fileId}`;
  if (data.file?._id) return `/api/v1/files/${data.file._id}`;
  if (data._id) return `/api/v1/files/${data._id}`;
  throw new Error("Resposta de upload inválida (nativo)");
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave?: (updated: ProfileData) => void;
};

export default function EditProfileModal({ visible, onClose, onSave }: Props) {
  const { user, updateUser } = useAuth();

  // Campos do formulário
  const [name, setName] = useState<string>(user?.username ?? user?.name ?? "");
  const [email, setEmail] = useState<string>(user?.email ?? "");
  const [phone, setPhone] = useState<string>((user as any)?.telefone ?? "");
  const [bio, setBio] = useState<string>((user as any)?.bio ?? "");

  // Avatar
  const [avatar, setAvatar] = useState<string | null | undefined>(
    (user as any)?.image ?? null,
  );
  const [avatarFileUri, setAvatarFileUri] = useState<string | null>(null);
  const [avatarMime, setAvatarMime] = useState<string | undefined>(undefined);
  const [avatarName, setAvatarName] = useState<string | undefined>(undefined);
  const [avatarRemoved, setAvatarRemoved] = useState<boolean>(false);

  // Endereço (visual)
  const [street, setStreet] = useState<string>(
    (user as any)?.address?.street ?? "",
  );
  const [number, setNumber] = useState<string>(
    (user as any)?.address?.number ?? "",
  );
  const [complement, setComplement] = useState<string>(
    (user as any)?.address?.complement ?? "",
  );
  const [neighborhood, setNeighborhood] = useState<string>(
    (user as any)?.address?.neighborhood ?? "",
  );
  const [city, setCity] = useState<string>((user as any)?.address?.city ?? "");
  const [stateField, setStateField] = useState<string>(
    (user as any)?.address?.state ?? "",
  );
  const [country, setCountry] = useState<string>(
    (user as any)?.address?.country ?? "",
  );
  const [zip, setZip] = useState<string>((user as any)?.address?.zip ?? "");

  const [saving, setSaving] = useState(false);

  // Reset ao abrir
  useEffect(() => {
    if (!visible) return;
    setName(user?.username ?? user?.name ?? "");
    setEmail(user?.email ?? "");
    setPhone((user as any)?.telefone ?? "");
    setBio((user as any)?.bio ?? "");
    setAvatar((user as any)?.image ?? null);
    setAvatarFileUri(null);
    setAvatarMime(undefined);
    setAvatarName(undefined);
    setAvatarRemoved(false);

    setStreet((user as any)?.address?.street ?? "");
    setNumber((user as any)?.address?.number ?? "");
    setComplement((user as any)?.address?.complement ?? "");
    setNeighborhood((user as any)?.address?.neighborhood ?? "");
    setCity((user as any)?.address?.city ?? "");
    setStateField((user as any)?.address?.state ?? "");
    setCountry((user as any)?.address?.country ?? "");
    setZip((user as any)?.address?.zip ?? "");
  }, [visible, user]);

  // Image Picker
  const loadImagePicker = async () => {
    try {
      const ImagePicker = await import("expo-image-picker");
      return ImagePicker;
    } catch {
      Alert.alert(
        "Módulo ausente",
        "O recurso de imagem requer 'expo-image-picker'. Execute: expo install expo-image-picker",
      );
      return null;
    }
  };
  const requestPermissions = async (ImagePicker: any) => {
    try {
      if (Platform.OS !== "web") {
        if (ImagePicker?.requestMediaLibraryPermissionsAsync) {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert(
              "Permissão necessária",
              "Precisamos de acesso à galeria/câmera para selecionar uma imagem.",
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
      console.warn("Erro de permissão:", e);
      return false;
    }
  };

  const pickFromGallery = async () => {
    const ImagePicker = await loadImagePicker();
    if (!ImagePicker) return;
    const ok = await requestPermissions(ImagePicker);
    if (!ok) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if ("canceled" in result) {
        if (result.canceled) return;
        const asset = result.assets?.[0];
        const uri = asset?.uri;
        if (uri) {
          setAvatar(uri);
          setAvatarFileUri(uri);
          setAvatarMime(asset?.mimeType);
          setAvatarName(asset?.fileName);
          setAvatarRemoved(false);
        }
        return;
      }

      const asset = (result as any).assets?.[0];
      const uri = asset?.uri ?? (result as any).uri ?? null;
      if (uri) {
        setAvatar(uri);
        setAvatarFileUri(uri);
        setAvatarMime(asset?.mimeType);
        setAvatarName(asset?.fileName);
        setAvatarRemoved(false);
      }
    } catch (e) {
      console.warn("Erro ao abrir galeria:", e);
      Alert.alert("Erro", "Não foi possível abrir a galeria.");
    }
  };

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

      if ("canceled" in result) {
        if (result.canceled) return;
        const asset = result.assets?.[0];
        const uri = asset?.uri;
        if (uri) {
          setAvatar(uri);
          setAvatarFileUri(uri);
          setAvatarMime(asset?.mimeType);
          setAvatarName(asset?.fileName);
          setAvatarRemoved(false);
        }
        return;
      }

      const asset = (result as any).assets?.[0];
      const uri = asset?.uri ?? (result as any).uri ?? null;
      if (uri) {
        setAvatar(uri);
        setAvatarFileUri(uri);
        setAvatarMime(asset?.mimeType);
        setAvatarName(asset?.fileName);
        setAvatarRemoved(false);
      }
    } catch (e) {
      console.warn("Erro ao abrir câmera:", e);
      Alert.alert("Erro", "Não foi possível usar a câmera.");
    }
  };

  const handleRemoveAvatar = () => {
    Alert.alert("Remover imagem", "Deseja remover a imagem do perfil?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => {
          setAvatar(null);
          setAvatarFileUri(null);
          setAvatarMime(undefined);
          setAvatarName(undefined);
          setAvatarRemoved(true);
        },
      },
    ]);
  };

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

      // Decide imagem a enviar
      let imageField: string | null | undefined = undefined;
      if (avatarRemoved && !avatar) {
        imageField = null; // remover
      } else if (avatarFileUri && isLocalUri(avatarFileUri)) {
        // Upload com expo-file-system (nativo) ou com Blob (web), sem setar Content-Type manualmente no nativo
        imageField = await uploadAvatar(avatarFileUri, avatarMime, avatarName);
      } else {
        imageField = undefined; // não enviar
      }

      const payload: any = {
        nome: name.trim(),
        email: email.trim(),
        telefone: phone?.trim() || undefined,
        bio: bio?.trim() || undefined,
      };
      if (imageField !== undefined) payload.image = imageField;

      const res = await api.put(
        `/api/v1/usuarios/usuarios/${user._id}`,
        payload,
      );
      const data = res.data ?? {};

      // Atualiza user no contexto
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
        organizations: data.organizations ?? user.organizations,
        role: data.role ?? user.role,
      });

      // Notifica o pai (opcional, caso precise refletir imediatamente no Drawer)
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
      console.error(
        "Erro ao salvar perfil:",
        err?.response?.data || err?.message || err,
      );
      Alert.alert(
        "Erro",
        err?.response?.data?.message ||
          err?.message ||
          "Não foi possível salvar o perfil.",
      );
    } finally {
      setSaving(false);
    }
  }

  const previewUri = resolveUri(avatar);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.centeredOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel="Fechar editar perfil"
            >
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
                <TouchableOpacity
                  style={styles.avatarBtn}
                  onPress={pickFromGallery}
                  disabled={saving}
                >
                  <Feather name="image" size={16} color="#007aff" />
                  <Text style={styles.avatarBtnText}>Galeria</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.avatarBtn}
                  onPress={takePhoto}
                  disabled={saving}
                >
                  <Feather name="camera" size={16} color="#007aff" />
                  <Text style={styles.avatarBtnText}>Câmera</Text>
                </TouchableOpacity>

                {(avatar || avatarRemoved) && (
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
                )}
              </View>
            </View>

            <Text style={styles.label}>Nome</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Seu nome"
              editable={!saving}
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!saving}
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Telefone</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              placeholder="+55 (xx) x xxxx-xxxx"
              keyboardType="phone-pad"
              editable={!saving}
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              style={styles.input}
              placeholder="Fale um pouco sobre você"
              editable={!saving}
            />

            <View style={{ height: 12 }} />
            <View style={styles.separator} />

            <Text style={styles.label}>Endereço (visual)</Text>
            <TextInput
              value={street}
              onChangeText={setStreet}
              style={styles.input}
              placeholder="Rua / Avenida"
              editable={!saving}
            />
            <TextInput
              value={number}
              onChangeText={setNumber}
              style={styles.input}
              placeholder="Número"
              editable={!saving}
            />
            <TextInput
              value={complement}
              onChangeText={setComplement}
              style={styles.input}
              placeholder="Complemento"
              editable={!saving}
            />
            <TextInput
              value={neighborhood}
              onChangeText={setNeighborhood}
              style={styles.input}
              placeholder="Bairro"
              editable={!saving}
            />
            <TextInput
              value={city}
              onChangeText={setCity}
              style={styles.input}
              placeholder="Cidade"
              editable={!saving}
            />
            <TextInput
              value={stateField}
              onChangeText={setStateField}
              style={styles.input}
              placeholder="Estado"
              editable={!saving}
            />
            <TextInput
              value={country}
              onChangeText={setCountry}
              style={styles.input}
              placeholder="País"
              editable={!saving}
            />
            <TextInput
              value={zip}
              onChangeText={setZip}
              style={styles.input}
              placeholder="CEP"
              keyboardType="numeric"
              editable={!saving}
            />

            <View style={{ height: 16 }} />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={onClose}
                disabled={saving}
              >
                <Text style={styles.btnTextSecondary}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.btnTextPrimary}>
                  {saving ? "Salvando..." : "Salvar"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  modalBox: {
    width: "92%",
    maxHeight: "92%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: { fontWeight: "700", fontSize: 16, color: "#222" },
  modalContentInner: { paddingBottom: 20 },

  avatarRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatarWrapper: {
    width: 86,
    height: 86,
    borderRadius: 44,
    overflow: "hidden",
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: { width: "100%", height: "100%" },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarActions: { marginLeft: 12, flex: 1, justifyContent: "center" },
  avatarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  avatarBtnText: { marginLeft: 8, color: "#007aff", fontWeight: "600" },

  label: { fontSize: 13, color: "#444", marginBottom: 6 },

  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
  },

  separator: { height: 1, backgroundColor: "#eee", marginVertical: 12 },

  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },
  btn: {
    minWidth: 96,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: { backgroundColor: "#007aff" },
  btnTextPrimary: { color: "#fff", fontWeight: "700" },
  btnSecondary: { backgroundColor: "#f2f2f2" },
  btnTextSecondary: { color: "#333", fontWeight: "700" },
});
