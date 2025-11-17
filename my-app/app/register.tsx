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
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth.context";

export default function Register() {
  const { signUp } = useAuth();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = "Nome é obrigatório";
    if (!email.trim()) e.email = "Email é obrigatório";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Email inválido";
    if (!senha || senha.length < 6)
      e.senha = "Senha deve ter ao menos 6 caracteres";
    if (!telefone || telefone.replace(/\D/g, "").length < 8)
      e.telefone = "Telefone inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = () => {
    if (!validate()) return;

    const payload = {
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senha,
      telefone: telefone.replace(/\D/g, ""),
    };
    signUp(payload);
  };

  const router = useRouter();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          {/* Logo Placeholder */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/logo5.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Crie sua conta</Text>
          <Text style={styles.subtitle}>
            Preencha os dados abaixo para se cadastrar
          </Text>

          {/* Campos */}
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            value={nome}
            onChangeText={setNome}
          />
          {errors.nome && <Text style={styles.error}>{errors.nome}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
          {errors.senha && <Text style={styles.error}>{errors.senha}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Telefone"
            value={telefone}
            onChangeText={(v) => setTelefone(v.replace(/[^\d]/g, ""))}
            keyboardType="phone-pad"
          />
          {errors.telefone && (
            <Text style={styles.error}>{errors.telefone}</Text>
          )}

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Registrar</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou continue com</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Login com Google */}
          <TouchableOpacity style={styles.googleButton}>
            <AntDesign name="google" size={20} color="#4285F4" />
            <Text style={styles.googleButtonText}>Registrar com Google</Text>
          </TouchableOpacity>

          {/* Rodapé */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem uma conta?</Text>
            <TouchableOpacity onPress={() => router.push("/")}>
              <Text style={styles.link}> Entrar</Text>
            </TouchableOpacity>
          </View>
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
    paddingVertical: 40,
    paddingHorizontal: 28,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 24,
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
    marginBottom: 24,
  },
  input: {
    width: "100%",
    height: 48,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
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
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#999",
    fontSize: 14,
  },
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
  googleButtonText: {
    color: "#333",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    marginTop: 28,
  },
  footerText: {
    color: "#444",
    fontSize: 14,
  },
  link: {
    color: "#007aff",
    fontWeight: "600",
  },
  logoImage: {
    width: 200,
    height: 120,
    borderRadius: 8,
    backgroundColor: "transparent",
    marginBottom: 0,
  },
});
