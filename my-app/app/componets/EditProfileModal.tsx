// EditProfileModal.tsx
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

export type ProfileData = {
  name: string;
  email: string;
  phone?: string;
  avatar?: string | null; // NOVO: URI da foto de perfil
  address?: {
    street?: string; // logradouro
    number?: string;
    complement?: string;
    neighborhood?: string; // bairro
    city?: string;
    state?: string;
    country?: string;
    zip?: string; // cep
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

/**
 * Props:
 * - visible: boolean
 * - initialData: ProfileData
 * - onClose: () => void
 * - onSave: (updated: ProfileData) => void
 */
export default function EditProfileModal({
  visible,
  initialData,
  onClose,
  onSave,
}: {
  visible: boolean;
  initialData: ProfileData;
  onClose: () => void;
  onSave: (updated: ProfileData) => void;
}) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [avatar, setavatar] = useState<string | null | undefined>(
    initialData?.avatar ?? null,
  );

  const [street, setStreet] = useState(initialData?.address?.street ?? "");
  const [number, setNumber] = useState(initialData?.address?.number ?? "");
  const [complement, setComplement] = useState(
    initialData?.address?.complement ?? "",
  );
  const [neighborhood, setNeighborhood] = useState(
    initialData?.address?.neighborhood ?? "",
  );
  const [city, setCity] = useState(initialData?.address?.city ?? "");
  const [stateField, setStateField] = useState(
    initialData?.address?.state ?? "",
  );
  const [country, setCountry] = useState(initialData?.address?.country ?? "");
  const [zip, setZip] = useState(initialData?.address?.zip ?? "");

  // reset local form whenever initialData or visible change
  useEffect(() => {
    setName(initialData?.name ?? "");
    setEmail(initialData?.email ?? "");
    setPhone(initialData?.phone ?? "");
    setavatar(initialData?.avatar ?? null);

    setStreet(initialData?.address?.street ?? "");
    setNumber(initialData?.address?.number ?? "");
    setComplement(initialData?.address?.complement ?? "");
    setNeighborhood(initialData?.address?.neighborhood ?? "");
    setCity(initialData?.address?.city ?? "");
    setStateField(initialData?.address?.state ?? "");
    setCountry(initialData?.address?.country ?? "");
    setZip(initialData?.address?.zip ?? "");
  }, [initialData, visible]);

  // helper: try to dynamically import expo-image-picker
  const loadImagePicker = async () => {
    try {
      // import dinâmico evita erro de bundler se o pacote não estiver instalado
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      // const ImagePicker = await import("expo-image-picker");
      // return ImagePicker;
    } catch (err) {
      // pacote não encontrado
      Alert.alert(
        "Módulo ausente",
        "O recurso de foto requer 'expo-image-picker'.\n\nExecute `expo install expo-image-picker` e recarregue o app.",
      );
      return null;
    }
  };

  // pedir permissão para a galeria/câmera (apenas iOS/Android)
  const requestPermissions = async (ImagePickerModule: any) => {
    try {
      if (Platform.OS !== "web") {
        // media library permission
        if (
          ImagePickerModule &&
          ImagePickerModule.requestMediaLibraryPermissionsAsync
        ) {
          const { status: mediaStatus } =
            await ImagePickerModule.requestMediaLibraryPermissionsAsync();
          if (mediaStatus !== "granted") {
            Alert.alert(
              "Permissão necessária",
              "Precisamos de acesso à galeria para escolher uma foto.",
            );
            return false;
          }
        }
        // camera permission (não obrigatório)
        if (
          ImagePickerModule &&
          ImagePickerModule.requestCameraPermissionsAsync
        ) {
          await ImagePickerModule.requestCameraPermissionsAsync();
          // não bloqueamos se não conceder
        }
      }
      return true;
    } catch (err) {
      console.warn("Erro pedindo permissões:", err);
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
        allowsEditing: true, // recortar
        aspect: [1, 1], // quadrado para avatar
      });

      // new versions return { cancelled, assets } where assets is array
      if ("cancelled" in result) {
        if (!result.cancelled)
          setavatar((result as any).uri ?? (result as any).assets?.[0]?.uri);
      } else if ((result as any).assets) {
        setavatar((result as any).assets[0]?.uri ?? null);
      } else {
        // fallback
        setavatar((result as any).uri ?? null);
      }
    } catch (err) {
      console.warn("Erro ao selecionar imagem:", err);
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
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

      if ("cancelled" in result) {
        if (!result.cancelled)
          setavatar((result as any).uri ?? (result as any).assets?.[0]?.uri);
      } else if ((result as any).assets) {
        setavatar((result as any).assets[0]?.uri ?? null);
      } else {
        setavatar((result as any).uri ?? null);
      }
    } catch (err) {
      console.warn("Erro ao tirar foto:", err);
      Alert.alert("Erro", "Não foi possível tirar a foto.");
    }
  };

  const handleRemoveAvatar = () => {
    Alert.alert("Remover foto", "Deseja remover a foto de perfil?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => setavatar(null),
      },
    ]);
  };

  const handleSave = () => {
    // validação mínima
    if (!name.trim()) {
      Alert.alert("Validação", "Nome é obrigatório.");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Validação", "Email é obrigatório.");
      return;
    }

    const updated: ProfileData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatar: avatar ?? null,
      address: {
        street: street.trim(),
        number: number.trim(),
        complement: complement.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: stateField.trim(),
        country: country.trim(),
        zip: zip.trim(),
      },
    };

    onSave(updated);
    onClose();
  };

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
            {/* AVATAR */}
            <View style={styles.avatarRow}>
              <View style={styles.avatarWrapper}>
                {avatar ? (
                  <Image source={{ uri: `http://localhost:3001${avatar}` }} style={styles.avatar} />
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
                >
                  <Feather name="image" size={16} color="#007aff" />
                  <Text style={styles.avatarBtnText}>Galeria</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.avatarBtn} onPress={takePhoto}>
                  <Feather name="camera" size={16} color="#007aff" />
                  <Text style={styles.avatarBtnText}>Câmera</Text>
                </TouchableOpacity>

                {avatar ? (
                  <TouchableOpacity
                    style={[styles.avatarBtn, { marginTop: 8 }]}
                    onPress={handleRemoveAvatar}
                  >
                    <Feather name="trash-2" size={16} color="red" />
                    <Text style={[styles.avatarBtnText, { color: "red" }]}>
                      Remover
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* CAMPOS DO FORM */}
            <Text style={styles.label}>Nome</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Seu nome"
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="seu@email.com"
              keyboardType="email-address"
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Telefone</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              placeholder="+55 (xx) x xxxx-xxxx"
              keyboardType="phone-pad"
            />

            <Text style={[styles.sectionTitle, { marginTop: 14 }]}>
              Endereço
            </Text>

            <Text style={styles.label}>Logradouro</Text>
            <TextInput
              value={street}
              onChangeText={setStreet}
              style={styles.input}
              placeholder="Rua / Avenida"
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Número</Text>
            <TextInput
              value={number}
              onChangeText={setNumber}
              style={styles.input}
              placeholder="Número"
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Complemento</Text>
            <TextInput
              value={complement}
              onChangeText={setComplement}
              style={styles.input}
              placeholder="Apto / Bloco / Complemento"
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Bairro</Text>
            <TextInput
              value={neighborhood}
              onChangeText={setNeighborhood}
              style={styles.input}
              placeholder="Bairro"
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Cidade</Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              style={styles.input}
              placeholder="Cidade"
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Estado</Text>
            <TextInput
              value={stateField}
              onChangeText={setStateField}
              style={styles.input}
              placeholder="Estado"
            />

            <Text style={[styles.label, { marginTop: 12 }]}>País</Text>
            <TextInput
              value={country}
              onChangeText={setCountry}
              style={styles.input}
              placeholder="País"
            />

            <Text style={[styles.label, { marginTop: 12 }]}>CEP</Text>
            <TextInput
              value={zip}
              onChangeText={setZip}
              style={styles.input}
              placeholder="00000-000"
              keyboardType="numeric"
            />

            <View style={{ height: 16 }} />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={onClose}
              >
                <Text style={styles.btnTextSecondary}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={handleSave}
              >
                <Text style={styles.btnTextPrimary}>Salvar</Text>
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
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
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
  sectionTitle: { fontSize: 14, color: "#333", fontWeight: "700" },

  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
  },

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
