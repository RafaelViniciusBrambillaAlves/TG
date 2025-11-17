// src/contexts/DataContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "@/services/api";
import { User } from "@/hooks/useLogin";
import { Necessidade } from "@/app/componets/CenterNeeds";

type Emergencia = {
  _id: string;
  titulo: string;
  subtitulo?: string | null;
  descricao?: string | null;
  data_inicio?: Date | null;
  data_fim?: Date | null;
  urgencia?: string | null;
  status?: string | null;
  id_usuario?: User;
  createdAt?: Date;
  updatedAt?: Date;
  cep?: string;
  numero?: number;
  address?: string;
  authorName?: string;
  orgId?: string;
  image?: string;
};

type Organizacao = {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  short?: string;
  description?: string;
  logo?: string;
};

type Publicacao = {
  _id: string;
  id_emergencia?: Emergencia;
  titulo?: string;
  descricao?: string;
  data_criacao?: Date;
  data_validade?: Date;
  status?: string;
  timeLabel?: string;
  centro?: Centro[];
  necessidades?: Necessidade[];
  usuario?: User;
};
type Centro = {
  orgId: string;
  nome: string;
  telefone?: string;
  email?: string | null;
  description: string;
  address: string;
  image: string;
};
type DataContextType = {
  emergencias: Emergencia[];
  organizacoes: Organizacao[];
  publicacoes: Publicacao[];
  loading: boolean;
  reloadAll: () => Promise<void>;
  getEmergencias: () => Promise<void>;
  getOrganizacoes: () => Promise<void>;
  getPublicacoes: () => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [emergencias, setEmergencias] = useState<Emergencia[]>([]);
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([]);
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Funções para buscar os dados
  const getEmergencias = async () => {
    try {
      const { data } = await api.get<Emergencia[]>(
        "/api/v1/emergencias/emergencias",
      );
      setEmergencias(data);
    } catch (error) {
      console.error("Erro ao carregar emergências:", error);
    }
  };

  const getOrganizacoes = async () => {
    try {
      const { data } = await api.get<Organizacao[]>("/api/v1/organizacao");
      setOrganizacoes(data);
    } catch (error) {
      console.error("Erro ao carregar organizações:", error);
    }
  };

  const getPublicacoes = async () => {
    try {
      const { data } = await api.get<Publicacao[]>(
        "/api/v1/publicacao/publicidades",
      );
      setPublicacoes(data);
    } catch (error) {
      console.error("Erro ao carregar publicações:", error);
    }
  };

  // Recarregar tudo
  const reloadAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        getEmergencias(),
        getOrganizacoes(),
        getPublicacoes(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Carrega tudo ao iniciar
  useEffect(() => {
    reloadAll();
  }, []);

  return (
    <DataContext.Provider
      value={{
        emergencias,
        organizacoes,
        publicacoes,
        loading,
        reloadAll,
        getEmergencias,
        getOrganizacoes,
        getPublicacoes,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Hook para usar o contexto
export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useData deve ser usado dentro de um DataProvider");
  }
  return ctx;
};
