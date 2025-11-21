// app/screens/Register.tsx  (substitua o arquivo atual por este)
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
  ActivityIndicator,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth.context";

export default function Register() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // mensagem visível no topo (fallback caso Alert não apareça)
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = "Nome é obrigatório";
    if (!email.trim()) e.email = "Email é obrigatório";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Email inválido";
    if (!senha || senha.length < 6) e.senha = "Senha deve ter ao menos 6 caracteres";
    if (!telefone || telefone.replace(/\D/g, "").length < 8) e.telefone = "Telefone inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  async function handleRegister() {
    if (loading) return;
    if (!validate()) {
      // mostra alerta e banner local
      setBanner({ type: "error", text: "Corrija os campos e tente novamente." });
      Alert.alert("Corrija os campos", "Verifique os campos destacados e tente novamente.");
      return;
    }

    setLoading(true);
    setErrors({});
    setBanner(null);

    const payload = {
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senha,
      telefone: telefone.replace(/\D/g, ""),
    };

    try {
      const res: any = await signUp(payload);

      // suporte para vários shapes de resposta
      const status = res?.status || res?.statusCode || (res?.ok ? 201 : undefined);

      if (status === 201 || status === 200) {
        // mostra alerta com botão OK que navega ao ser pressionado
        Alert.alert("Sucesso", "Conta criada com sucesso!", [
          {
            text: "OK",
            onPress: () => {
              // navega apenas quando usuário confirmar
              router.replace("/");
            },
          },
        ]);

        // também exibe banner imediatamente (fallback)
        setBanner({ type: "success", text: "Conta criada com sucesso!" });

        // limpa campos
        setNome("");
        setEmail("");
        setSenha("");
        setTelefone("");
        setErrors({});
      } else if (status === 400) {
        const message =
          res?.data?.message || res?.message || res?.data?.error || "Email já cadastrado ou dados inválidos.";
        setBanner({ type: "error", text: message });
        Alert.alert("Problema", message);
      } else {
        setBanner({ type: "error", text: "Erro desconhecido ao registrar." });
        Alert.alert("Problema", "Erro desconhecido ao registrar.");
      }
    } catch (err: any) {

      const serverStatus = err?.response?.status || err?.status;
      if (serverStatus === 400) {
        const payloadErr = err?.response?.data || {};
        const message = payloadErr?.message || payloadErr?.error || "Email já cadastrado ou dados inválidos.";
        setBanner({ type: "error", text: message });
        Alert.alert("Problema", message);
      } else {
        // fallback genérico
        const message = err?.message || "Erro ao conectar ao servidor.";
        setBanner({ type: "error", text: message });
        Alert.alert("Problema", message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {/* BANNER VISÍVEL: aparece sempre (fallback caso Alert não seja mostrado) */}
          {banner && (
            <View
              style={[
                styles.banner,
                banner.type === "success" ? styles.bannerSuccess : styles.bannerError,
              ]}
              accessibilityLiveRegion="polite"
            >
              <Text style={styles.bannerText}>{banner.text}</Text>
            </View>
          )}

          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/logo5.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Crie sua conta</Text>
          <Text style={styles.subtitle}>Preencha os dados abaixo para se cadastrar</Text>

          <TextInput
            style={[styles.input, errors.nome ? styles.inputError : null]}
            placeholder="Nome completo"
            value={nome}
            onChangeText={(v) => {
              setNome(v);
              if (errors.nome) setErrors((s) => ({ ...s, nome: undefined }));
            }}
            accessibilityLabel="Nome completo"
            autoComplete="name"
            returnKeyType="next"
          />
          {errors.nome && <Text style={styles.error}>{errors.nome}</Text>}

          <TextInput
            style={[styles.input, errors.email ? styles.inputError : null]}
            placeholder="Email"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (errors.email) setErrors((s) => ({ ...s, email: undefined }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            accessibilityLabel="Email"
            autoComplete="email"
            returnKeyType="next"
          />
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}

          <TextInput
            style={[styles.input, errors.senha ? styles.inputError : null]}
            placeholder="Senha (mínimo 6 caracteres)"
            value={senha}
            onChangeText={(v) => {
              setSenha(v);
              if (errors.senha) setErrors((s) => ({ ...s, senha: undefined }));
            }}
            secureTextEntry
            accessibilityLabel="Senha"
            autoComplete="password"
            returnKeyType="next"
          />
          {errors.senha && <Text style={styles.error}>{errors.senha}</Text>}

          <TextInput
            style={[styles.input, errors.telefone ? styles.inputError : null]}
            placeholder="Telefone (somente números)"
            value={telefone}
            onChangeText={(v) => {
              const digits = v.replace(/[^\d]/g, "");
              setTelefone(digits);
              if (errors.telefone) setErrors((s) => ({ ...s, telefone: undefined }));
            }}
            keyboardType="phone-pad"
            accessibilityLabel="Telefone"
            returnKeyType="done"
          />
          {errors.telefone && <Text style={styles.error}>{errors.telefone}</Text>}

          <TouchableOpacity
            style={[styles.button, loading ? styles.buttonDisabled : null]}
            onPress={handleRegister}
            disabled={loading}
            accessibilityRole="button"
            accessibilityState={{ busy: loading }}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registrar</Text>}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou continue com</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => Alert.alert("Atenção", "Registrar com Google não implementado.")}
          >
            <AntDesign name="google" size={20} color="#4285F4" />
            <Text style={styles.googleButtonText}>Registrar com Google</Text>
          </TouchableOpacity>

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
    paddingVertical: 36,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
    alignItems: "center",
  },
  // banner (fallback visual)
  banner: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  bannerSuccess: {
    backgroundColor: "#e6ffef",
    borderWidth: 1,
    borderColor: "#b6f0cf",
  },
  bannerError: {
    backgroundColor: "#ffecec",
    borderWidth: 1,
    borderColor: "#f5b6b6",
  },
  bannerText: {
    color: "#0f172a",
    fontSize: 14,
    textAlign: "center",
  },
  logoContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 18,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 48,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e6e9ef",
  },
  inputError: {
    borderColor: "#f04438",
  },
  error: {
    alignSelf: "flex-start",
    color: "#d23",
    marginBottom: 8,
    marginLeft: 6,
    fontSize: 13,
  },
  button: {
    width: "100%",
    height: 48,
    backgroundColor: "#0b5fff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e6e9ef",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#94a3b8",
    fontSize: 13,
  },
  googleButton: {
    width: "100%",
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6e9ef",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  googleButtonText: {
    color: "#111827",
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "400",
  },
  footer: {
    flexDirection: "row",
    marginTop: 18,
  },
  footerText: {
    color: "#475569",
    fontSize: 14,
  },
  link: {
    color: "#0b5fff",
    fontWeight: "700",
  },
  logoImage: {
    width: 180,
    height: 80,
    borderRadius: 8,
    backgroundColor: "transparent",
    marginBottom: 8,
  },
});
