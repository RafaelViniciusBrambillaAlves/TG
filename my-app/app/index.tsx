// src/screens/Login.tsx
import React, { useEffect, useRef, useState } from "react";
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
  Animated,
  Easing,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth.context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ATTEMPTS_KEY = "@login_attempts";
const LOCK_KEY = "@login_lock_until";
const MAX_ATTEMPTS = 5; // após 5 tentativas bloqueia
const LOCK_MS = 60 * 1000; // 60s bloqueio

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [attempts, setAttempts] = useState<number>(0);
  const [lockUntil, setLockUntil] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(0);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const emailRef = useRef<TextInput | null>(null);
  const pwdRef = useRef<TextInput | null>(null);

  // shake animation for card
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // load attempts and lock from storage
    (async () => {
      try {
        const att = await AsyncStorage.getItem(ATTEMPTS_KEY);
        const lk = await AsyncStorage.getItem(LOCK_KEY);
        if (att) setAttempts(Number(att));
        if (lk) {
          const until = Number(lk);
          setLockUntil(until);
          if (until > Date.now()) startCountdown(until);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(ATTEMPTS_KEY, String(attempts)).catch(() => {});
  }, [attempts]);

  const startCountdown = (until: number) => {
    setLockUntil(until);
    const tick = () => {
      const left = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      setCountdown(left);
      if (left <= 0) {
        setLockUntil(0);
        setCountdown(0);
        setAttempts(0);
        AsyncStorage.removeItem(LOCK_KEY).catch(() => {});
        AsyncStorage.setItem(ATTEMPTS_KEY, "0").catch(() => {});
        clearInterval(intervalId);
      }
    };
    tick();
    const intervalId = setInterval(tick, 500);
    return () => clearInterval(intervalId);
  };

  const triggerLock = async (ms = LOCK_MS) => {
    const until = Date.now() + ms;
    setLockUntil(until);
    await AsyncStorage.setItem(LOCK_KEY, String(until));
    startCountdown(until);
  };

  const shake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 1, duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, easing: Easing.linear, useNativeDriver: true }),
    ]).start();
  };

  // translateX interpolation
  const translateX = shakeAnim.interpolate({
    inputRange: [-1, -0.5, 0, 0.5, 1],
    outputRange: [-8, -4, 0, 4, 8],
  });

  const validateBeforeSubmit = (): boolean => {
    const errs: { email?: string; password?: string } = {};
    const emailTrim = email.trim();
    const pwdTrim = password;
    if (!emailTrim) errs.email = "Preencha o email.";
    else if (!/\S+@\S+\.\S+/.test(emailTrim)) errs.email = "Digite um email válido.";
    if (!pwdTrim) errs.password = "Preencha a senha.";
    setFieldErrors(errs);
    if (errs.email) emailRef.current?.focus();
    else if (errs.password) pwdRef.current?.focus();
    return Object.keys(errs).length === 0;
  };

  const handleFailedAttempt = async (reason?: "email" | "password" | "general") => {
    const next = attempts + 1;
    setAttempts(next);
    await AsyncStorage.setItem(ATTEMPTS_KEY, String(next)).catch(() => {});
    shake();
    if (next >= MAX_ATTEMPTS) {
      await triggerLock();
      Alert.alert(
        "Bloqueado temporariamente",
        `Muitas tentativas erradas. Tente novamente em ${Math.ceil(LOCK_MS / 1000)} segundos.`,
      );
    } else {
      const left = MAX_ATTEMPTS - next;
      const msg = reason === "email"
        ? "Usuário não encontrado. Verifique o email."
        : reason === "password"
        ? "Senha incorreta."
        : "Email ou senha incorretos.";
      Alert.alert("Falha no login", `${msg} (${left} tentativa(s) restantes)`);
    }
  };

  const handleSubmit = async () => {
    // don't change UX: keeps your signIn call exactly the same
    if (lockUntil && lockUntil > Date.now()) {
      Alert.alert("Acesso bloqueado", `Tente novamente em ${countdown}s.`);
      return;
    }

    setFieldErrors({});
    if (!validateBeforeSubmit()) return;

    setLocalLoading(true);
    try {
      await signIn({ email: email.trim(), password });
      // on success reset attempts and lock
      setAttempts(0);
      AsyncStorage.setItem(ATTEMPTS_KEY, "0").catch(() => {});
      AsyncStorage.removeItem(LOCK_KEY).catch(() => {});
      router.replace("/screens");
    } catch (err: any) {
      // extract HTTP-like info if available (axios style)
      const status = err?.response?.status ?? err?.status;
      const message = err?.response?.data?.message ?? err?.message ?? "Falha no login.";

      if (status === 404 || /user/i.test(message)) {
        setFieldErrors({ email: "Usuário não encontrado." });
        emailRef.current?.focus();
        await handleFailedAttempt("email");
      } else if (status === 401 || /password|senha/i.test(message)) {
        setFieldErrors({ password: "Senha incorreta." });
        pwdRef.current?.focus();
        await handleFailedAttempt("password");
      } else {
        // generic
        await handleFailedAttempt("general");
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogle = () => {
    Alert.alert("Info", "Login com Google não implementado aqui.");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: "height" })}
    >
      <Animated.View style={[styles.card, { transform: [{ translateX }] }]}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo5.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Entrar</Text>

        <TextInput
          ref={emailRef}
          style={[styles.input, fieldErrors.email ? styles.inputError : null]}
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(t) => setEmail(t)}
          importantForAutofill="yes"
          textContentType="username"
          returnKeyType="next"
          onSubmitEditing={() => pwdRef.current?.focus()}
        />
        {fieldErrors.email ? <Text style={styles.errorMini}>{fieldErrors.email}</Text> : null}

        <View style={styles.inputContainer}>
          <TextInput
            ref={pwdRef}
            style={[styles.inputPassword, fieldErrors.password ? styles.inputError : null]}
            placeholder="Senha"
            placeholderTextColor="#888"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(t) => setPassword(t)}
            importantForAutofill="yes"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword((s) => !s)}
            accessibilityLabel={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            <AntDesign name={showPassword ? "eye-invisible" : "eye"} size={20} color="#888" />
          </TouchableOpacity>
        </View>
        {fieldErrors.password ? <Text style={styles.errorMini}>{fieldErrors.password}</Text> : null}

        <TouchableOpacity
          style={[styles.button, localLoading ? { opacity: 0.8 } : {}]}
          onPress={handleSubmit}
          disabled={localLoading}
        >
          {localLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
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
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 6,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputContainer: {
    position: "relative",
    width: "100%",
    height: 48,
    marginBottom: 6,
  },
  inputPassword: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingRight: 40, // Espaço para o ícone
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: "43%",
    transform: [{ translateY: -10 }],
    padding: 3,
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
  googleButtonText: { color: "#333", fontSize: 16, marginLeft: 8 },
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

  /* visual feedback for errors */
  errorMini: {
    width: "100%",
    color: "#dc2626",
    fontWeight: "600",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  inputError: {
    borderColor: "#dc2626",
    shadowColor: "#dc2626",
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
});
