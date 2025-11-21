// ForgotPassword.tsx
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { useRouter } from "expo-router";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Email é obrigatório";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Email inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSendCode = async () => {
    if (!validate()) return;

    // Simulação de request -> substitua pela sua chamada real
    try {
      setLoading(true);
      const payload = { email: email.trim().toLowerCase() };

      // Ex.: await api.post('/auth/forgot-password', payload);

      // Mensagem clara pro usuário
      Alert.alert(
        "Verificação enviada",
        "Enviamos um código de verificação para o seu email. Verifique a caixa de entrada (e spam)."
      );

      // navegar para a tela de verificação de código (se existir)
      // router.push("/reset-code"); // descomente e ajuste se tiver essa rota
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível enviar o código. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {/* Logo Placeholder */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/logo5.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Esqueci a senha</Text>
          <Text style={styles.subtitle}>
            Informe o seu email e enviaremos um código de verificação para redefinir sua senha.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="send"
            onSubmitEditing={handleSendCode}
          />
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendCode}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "Enviando..." : "Enviar código"}</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => router.push("/")}
          >
            <Text style={styles.backToLoginText}>Voltar ao login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6fa",
    paddingVertical: 40,
  },
  card: {
    width: "85%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 36,
    paddingHorizontal: 28,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 0,
  },
  logoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: "#e0e0e0",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#222",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 48,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  error: {
    alignSelf: "flex-start",
    color: "#d23",
    marginBottom: 8,
    marginLeft: 6,
  },
  button: {
    width: "100%",
    height: 48,
    backgroundColor: "#007aff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#eee",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#999",
    fontSize: 13,
  },
  backToLogin: {
    paddingVertical: 8,
  },
  backToLoginText: {
    color: "#007aff",
    fontWeight: "600",
    fontSize: 15,
  },
  logoImage: {
    width: 200,    
    height: 120,
    borderRadius: 8, 
    backgroundColor: "transparent",
    marginBottom: 0,
  },
});
