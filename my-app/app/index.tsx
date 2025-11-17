// src/screens/Login.tsx  (ou onde estiver seu componente)
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth.context";

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert("Erro", "Preencha email e senha.");
    }

    setLocalLoading(true);
    try {
      // signIn do AuthContext espera { email, password }
      await signIn({ email, password });
      // Login ok — substitui a rota atual pela principal (ex: /home)
      router.replace("/screens");
    } catch (err: any) {
      // tenta extrair mensagem do erro (ajuste conforme sua API)
      const message =
        err?.response?.data?.message || err?.message || "Falha no login.";
      Alert.alert("Erro ao entrar", message);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogle = () => {
    // aqui você colocaria a lógica de login com Google (expo-auth-session ou pacote)
    Alert.alert("Info", "Login com Google não implementado aqui.");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo5.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Entrar</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          importantForAutofill="yes"
          textContentType="username"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          importantForAutofill="yes"
          textContentType="password"
        />

        <TouchableOpacity
          style={[styles.button, localLoading ? { opacity: 0.8 } : {}]}
          onPress={handleSubmit}
          disabled={localLoading}
        >
          {localLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/ForgotPassword")}>
          <Text style={styles.forgotPassword}>Esqueceu sua senha?</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou continue com</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.googleButton} onPress={handleGoogle}>
          <AntDesign name="google" size={20} color="#4285F4" />
          <Text style={styles.googleButtonText}>Entrar com Google</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem uma conta?</Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.link}> Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  /* ... use exatamente os estilos que você já tem ... */
  container: {
    flex: 1,
    backgroundColor: "#f4f6fa",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "85%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 28,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "center",
  },
  logoContainer: { marginBottom: 0 },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    height: 48,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
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
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  forgotPassword: { marginTop: 12, color: "#007aff", fontSize: 14 },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 24,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#ddd" },
  dividerText: { marginHorizontal: 10, color: "#999", fontSize: 14 },
  googleButton: {
    width: "100%",
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  googleButtonText: { color: "#333", fontSize: 16 },
  footer: { flexDirection: "row", marginTop: 28 },
  footerText: { color: "#444", fontSize: 14 },
  link: { color: "#007aff", fontWeight: "600" },
  logoImage: {
    width: 280,
    height: 120,
    borderRadius: 8,
    backgroundColor: "transparent",
    marginTop: 50,
    marginBottom: 50,
  },
});
