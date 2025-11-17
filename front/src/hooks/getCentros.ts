import api from "@/services/api";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export interface Centro {
  _id?: string;
  orgId?: string;
  nome: string;
  telefone?: string;
  email?: string | null;
  description: string;
  address: string;
  image: string;
}
export const getCentros = async (): Promise<Centro[]> => {
  const { data } = await api.get<Centro[]>("/api/v1/centros");
  return data;
};
