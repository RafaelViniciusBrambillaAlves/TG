// src/hooks/useLogin.ts
import api from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";

export type LoginPayload = {
  email: string;
  senha: string;
};

export type User = {
  id_usuario: number;
  username: string;
  email: string;
  telefone?: string | null;
  id_perfil?: number | null;
  image?: string;
  token?: string;
};
export type SignInRequestData = {
  email: string;
  password: string;
};

export type signInRequestResult = {
  token: string;
  data: UserProfile;
};
export type UserProfile = {
  _id: string;
  username: string;
  email: string;
  telefone?: string;
  organizations: ONG[];
  avatarUrl?: string;
  bio?: string;
  image?: string;
  role: {
    nome_perfil: String;
  };
  password?: string;
};
export type ONG = {
  id: string;
  name: string;
  short?: string;
  description?: string;
  phone?: string;
  email?: string;
  logo?: string;
  website?: string;
};
export type SignInData = {
  email: string;
  password: string;
  token?: string;
};
export type SignUpRequestData = {
  name: string;
  password_confirmation: string;
} & SignInRequestData;
export default function useLogin() {
  async function signInRequest(
    signInData: SignInData,
  ): Promise<signInRequestResult> {
    const { data } = await api.post<signInRequestResult>(
      "/api/v1/usuarios/login",
      signInData,
    );
    return data;
  }

  async function signUpRequest(signUpData: SignUpRequestData) {
    const data = await api.post<string>(
      "/api/v1/usuarios/register",
      signUpData,
    );
    return data;
  }

  return { signInRequest, signUpRequest };
}
