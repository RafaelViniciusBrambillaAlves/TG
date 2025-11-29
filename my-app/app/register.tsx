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
import { AxiosResponse } from "axios";

export default function Register() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // mensagem visível no topo (fallback caso Alert não apareça)
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // === ADICIONADO: controle para mostrar/ocultar senha ===
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // ========================================================

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = "Nome é obrigatório";
    if (!email.trim()) e.email = "Email é obrigatório";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Email inválido";
    if (!senha || senha.length < 6)
      e.senha = "Senha deve ter ao menos 6 caracteres";
    if (!confirmSenha) e.confirmSenha = "Confirme a senha";
    else if (senha !== confirmSenha) e.confirmSenha = "Senhas não conferem";
    if (!telefone || telefone.replace(/\D/g, "").length < 8)
      e.telefone = "Telefone inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  async function handleRegister() {
    if (loading) return;
    if (!validate()) {
      // mostra alerta e banner local
      setBanner({
        type: "error",
        text: "Corrija os campos e tente novamente.",
      });
      Alert.alert(
        "Corrija os campos",
        "Verifique os campos destacados e tente novamente.",
      );
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
      const res: AxiosResponse = await signUp(payload);
      console.log(res);
      // suporte para vários shapes de resposta
      const status = res?.status;

      if (status === 201 || status === 200) {
        // mostra alerta com botão OK que navega ao ser pressionado
        Alert.alert("Sucesso", "Conta criada com sucesso!", [
          {
            text: "OK",
            onPress: () => {
              // navega apenas quando usuário confirmar
            },
          },
        ]);
        // também exibe banner imediatamente (fallback)
        setBanner({ type: "success", text: "Conta criada com sucesso!" });

        // limpa campos
        setNome("");
        setEmail("");
        setSenha("");
        setConfirmSenha("");
        setTelefone("");
        setErrors({});

        setTimeout(() => {
          router.replace("/");
        }, 2000);
      } else if (status === 400) {
        const message =
          res?.data?.message ||
          res?.message ||
          res?.data?.error ||
          "Email já cadastrado ou dados inválidos.";
        setBanner({ type: "error", text: message });
        Alert.alert("Problema", message);
      } else {
        setBanner({ type: "error", text: "Erro desconhecido ao registrar." });
        Alert.alert("Problema", "Erro desconhecido ao registrar.");
      }
    } catch (err: any) {
      console.log(err);
      const serverStatus = err?.response?.status || err?.status;
      if (serverStatus === 400) {
        const payloadErr = err?.response?.data || {};
        const message =
          payloadErr?.message ||
          payloadErr?.error ||
          "Email já cadastrado ou dados inválidos.";
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
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* BANNER VISÍVEL: aparece sempre (fallback caso Alert não seja mostrado) */}
          {banner && (
            <View
              style={[
                styles.banner,
                banner.type === "success"
                  ? styles.bannerSuccess
                  : styles.bannerError,
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
          <Text style={styles.subtitle}>
            Preencha os dados abaixo para se cadastrar
          </Text>

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

          {/* === ALTERADO: campo de senha com ícone de olho === */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.inputPassword,
                errors.senha ? styles.inputError : null,
              ]}
              placeholder="Senha (mínimo 6 caracteres)"
              value={senha}
              onChangeText={(v) => {
                setSenha(v);
                if (errors.senha) setErrors((s) => ({ ...s, senha: undefined }));
                // limpa erro de confirmação quando as senhas passam a bater
                if (errors.confirmSenha && v === confirmSenha)
                  setErrors((s) => ({ ...s, confirmSenha: undefined }));
              }}
              secureTextEntry={!showPassword}
              accessibilityLabel="Senha"
              autoComplete="password"
              returnKeyType="next"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword((s) => !s)}
              accessibilityLabel={
                showPassword ? "Ocultar senha" : "Mostrar senha"
              }
            >
              <AntDesign
                name={showPassword ? "eye-invisible" : "eye"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>
          {errors.senha && <Text style={styles.error}>{errors.senha}</Text>}
          {/* ===================================================== */}

          {/* === NOVO: campo Confirmar senha com ícone de olho === */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.inputPassword,
                errors.confirmSenha ? styles.inputError : null,
              ]}
              placeholder="Confirmar senha"
              value={confirmSenha}
              onChangeText={(v) => {
                setConfirmSenha(v);
                if (errors.confirmSenha && v === senha)
                  setErrors((s) => ({ ...s, confirmSenha: undefined }));
              }}
              secureTextEntry={!showConfirmPassword}
              accessibilityLabel="Confirmar senha"
              autoComplete="password"
              returnKeyType="next"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword((s) => !s)}
              accessibilityLabel={
                showConfirmPassword ? "Ocultar confirmação" : "Mostrar confirmação"
              }
            >
              <AntDesign
                name={showConfirmPassword ? "eye-invisible" : "eye"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>
          {errors.confirmSenha && (
            <Text style={styles.error}>{errors.confirmSenha}</Text>
          )}
          {/* ===================================================== */}

          <TextInput
            style={[styles.input, errors.telefone ? styles.inputError : null]}
            placeholder="Telefone (somente números)"
            value={telefone}
            onChangeText={(v) => {
              const digits = v.replace(/[^\d]/g, "");
              setTelefone(digits);
              if (errors.telefone)
                setErrors((s) => ({ ...s, telefone: undefined }));
            }}
            keyboardType="phone-pad"
            accessibilityLabel="Telefone"
            returnKeyType="done"
          />
          {errors.telefone && (
            <Text style={styles.error}>{errors.telefone}</Text>
          )}

          <TouchableOpacity
            style={[styles.button, loading ? styles.buttonDisabled : null]}
            onPress={handleRegister}
            disabled={loading}
            accessibilityRole="button"
            accessibilityState={{ busy: loading }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Registrar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou continue com</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={() =>
              Alert.alert("Atenção", "Registrar com Google não implementado.")
            }
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

  // === ADICIONADOS: estilos para o input de senha com ícone ===
  inputContainer: {
    position: "relative",
    width: "100%",
    height: 48,
    marginBottom: 8,
  },
  inputPassword: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingRight: 44, // espaço para o ícone
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e6e9ef",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: "41%",
    transform: [{ translateY: -10 }],
    padding: 4,
  },
  // ===========================================================

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
