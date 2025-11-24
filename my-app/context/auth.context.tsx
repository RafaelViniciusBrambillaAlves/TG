// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/services/api";
import useLogin, {
  SignInData,
  SignUpRequestData,
  signInRequestResult,
  UserProfile,
} from "@/hooks/useLogin";
import { useRouter } from "expo-router";

type AuthContextType = {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  signIn: (data: SignInData) => Promise<void>;
  signUp: (data: SignUpRequestData) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: UserProfile) => Promise<void>;
};

const STORAGE_TOKEN_KEY = "@myapp:token";
const STORAGE_USER_KEY = "@myapp:user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { signInRequest, signUpRequest } = useLogin();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // aplica header Authorization no axios
  const applyAuthHeader = (tok: string | null) => {
    if (tok) {
      api.defaults.headers.common["Authorization"] = `Bearer ${tok}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  };

  // Restaura token + user do AsyncStorage ao montar
  useEffect(() => {
    const restore = async () => {
      try {
        const [storedToken, storedUser] = await AsyncStorage.multiGet([
          STORAGE_TOKEN_KEY,
          STORAGE_USER_KEY,
        ]);
        const t = storedToken[1];
        const u = storedUser[1];

        if (t) {
          setToken(t);
          applyAuthHeader(t);
        }

        if (u) {
          try {
            const parsed: UserProfile = JSON.parse(u);
            setUser(parsed);
            router.replace("/screens");
          } catch {
            // se parsing falhar, remover chave inválida
            await AsyncStorage.removeItem(STORAGE_USER_KEY);
            setUser(null);
          }
        } else {
          router.replace("/");
        }
      } catch (err) {
        console.warn("Auth restore failed:", err);
      } finally {
        setLoading(false);
      }
    };

    restore();
  }, []);

  // signIn usando seu hook useLogin
  const signIn = async (data: SignInData) => {
    setLoading(true);
    try {
      const res: signInRequestResult = await signInRequest(data);

      // res.token ou res.data.token? sua tipagem mostra token + data.token.
      // vamos priorizar res.token e depois res.data.token
      const tok = res.token ?? res.token ?? null;
      const userFromRes = res ?? null;

      if (!tok) throw new Error("Token não retornado pelo servidor.");

      setToken(tok);
      applyAuthHeader(tok);

      if (userFromRes) {
        setUser(userFromRes);
        await AsyncStorage.multiSet([
          [STORAGE_TOKEN_KEY, tok],
          [STORAGE_USER_KEY, JSON.stringify(userFromRes)],
        ]);
      } else {
        // Se o endpoint não retorna user, apenas salva o token
        await AsyncStorage.setItem(STORAGE_TOKEN_KEY, tok);
      }
    } finally {
      setLoading(false);
    }
  };

  // signUp (chama seu signUpRequest)
  const signUp = async (data: SignUpRequestData) => {
    setLoading(true);
    try {
      await signUpRequest(data);
      // após cadastro, normalmente redireciona para login.
      // não fazemos login automático aqui porque o endpoint pode não retornar token.
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // signOut
  const signOut = async () => {
    setLoading(true);
    try {
      setUser(null);
      setToken(null);
      applyAuthHeader(null);
      await AsyncStorage.multiRemove([STORAGE_TOKEN_KEY, STORAGE_USER_KEY]);
    } finally {
      setLoading(false);
    }
  };

  // updateUser -> atualiza estado e persiste
  const updateUser = async (updated: UserProfile) => {
    setUser(updated);
    try {
      await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn("Falha ao salvar user:", err);
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      signIn,
      signUp,
      signOut,
      updateUser,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook para acessar o context
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
