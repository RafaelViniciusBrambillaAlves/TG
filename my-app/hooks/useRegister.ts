// src/hooks/useRegister.ts
import { useCallback, useState } from "react";

export type RegisterPayload = {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  id_perfil?: number | null;
  id_endereco?: number | null;
};

export type CreatedUser = {
  id_usuario: number;
  nome: string;
  email: string;
  telefone?: string | null;
  id_perfil?: number | null;
  data_criacao: string;
};

export default function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);

  const register = useCallback(async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);

    try {
      await new Promise((res) => setTimeout(res, 900)); // mock delay

      // basic mock validation
      if (!payload.nome || !payload.email || !payload.senha) {
        throw new Error("nome, email e senha são obrigatórios");
      }
      if (!/^\S+@\S+\.\S+$/.test(payload.email)) {
        throw new Error("Email inválido");
      }
      if (payload.senha.length < 6) {
        throw new Error("Senha deve ter ao menos 6 caracteres");
      }

      const now = new Date().toISOString();
      const mockCreated: CreatedUser = {
        id_usuario: Math.floor(Math.random() * 10000) + 100,
        nome: payload.nome,
        email: payload.email,
        telefone: payload.telefone ?? null,
        id_perfil: payload.id_perfil ?? null,
        data_criacao: now,
      };

      setCreatedUser(mockCreated);
      return mockCreated;
    } catch (err: any) {
      setError(err.message ?? "Erro inesperado no registro");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createdUser, loading, error, register, setCreatedUser };
}
