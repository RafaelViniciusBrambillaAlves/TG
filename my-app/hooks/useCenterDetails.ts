// src/hooks/useCenterDetails.ts
import { useCallback, useState } from "react";

export type CenterDetail = {
  id_centro: number;
  nome_centro: string;
  descricao?: string | null;
  telefone?: string | null;
  email?: string | null;
  id_organizacao?: number | null;
  endereco?: {
    id_endereco?: number;
    logradouro?: string | null;
    numero?: string | null;
    complemento?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    estado?: string | null;
    pais?: string | null;
    cep?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  necessidades?: {
    id_necessidade: number;
    nome_recurso: string;
    descricao?: string | null;
    quantidade_necessaria?: number | null;
    quantidade_intencao?: number | null;
    tipo_voluntariado?: string | null;
    status?: string | null;
  }[] | null;
};

const MOCK_CENTER_1: CenterDetail = {
  id_centro: 1,
  nome_centro: "Centro Comunitário Navegantes",
  descricao: "Espaço comunitário destinado ao acolhimento de famílias desalojadas pelas enchentes.",
  telefone: "(51) 3345-8721",
  email: "centrocnavegantes@gmail.com",
  id_organizacao: 10,
  endereco: {
    id_endereco: 101,
    logradouro: "Av. Navegantes",
    numero: "123",
    complemento: "Próximo à praça",
    bairro: "Navegantes",
    cidade: "Porto Alegre",
    estado: "RS",
    pais: "Brasil",
    cep: "90000-000",
    latitude: -30.0123,
    longitude: -51.2000,
  },
  necessidades: [
    {
      id_necessidade: 2001,
      nome_recurso: "Kits de Higiene Pessoal",
      descricao: "Sabonete, escova de dente, pasta, absorventes",
      quantidade_necessaria: 300,
      quantidade_intencao: 12,
      tipo_voluntariado: "Doação",
      status: "aberta",
    },
    {
      id_necessidade: 2002,
      nome_recurso: "Água potável (galões)",
      descricao: "Galões 20L para cozinha coletiva",
      quantidade_necessaria: 50,
      quantidade_intencao: 5,
      tipo_voluntariado: "Doação",
      status: "aberta",
    },
    {
      id_necessidade: 2003,
      nome_recurso: "Assistencia Médica",
      descricao: "Médicos capacitados",
      quantidade_necessaria: 2,
      quantidade_intencao: 1,
      tipo_voluntariado: "Voluntário",
      status: "aberta",
    }
  ],
};

const MOCK_CENTER_2: CenterDetail = {
  id_centro: 2,
  nome_centro: "Ginásio da Restinga",
  descricao: "Estrutura esportiva adaptada para receber moradores desalojados.",
  telefone: "(51) 3267-4450",
  email: null,
  id_organizacao: 11,
  endereco: {
    id_endereco: 102,
    logradouro: "R. do Esporte",
    numero: "500",
    complemento: null,
    bairro: "Restinga",
    cidade: "Porto Alegre",
    estado: "RS",
    pais: "Brasil",
    cep: "91700-000",
    latitude: -30.1100,
    longitude: -51.2500,
  },
  necessidades: [
    {
      id_necessidade: 3001,
      nome_recurso: "Cobertores",
      descricao: "Cobertores para adultos",
      quantidade_necessaria: 200,
      quantidade_intencao: 0,
      tipo_voluntariado: "doacao",
      status: "aberta",
    },
  ],
};

export default function useCenterDetails() {
  const [data, setData] = useState<CenterDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 350)); // mock latency
      // **mock API responses prontos** (sem filtro/algoritmo)
      if (id === 1) {
        setData(MOCK_CENTER_1);
        return MOCK_CENTER_1;
      }
      if (id === 2) {
        setData(MOCK_CENTER_2);
        return MOCK_CENTER_2;
      }
      // caso id não mapeado, retorna null ou lança erro
      setData(null);
      throw new Error("Centro não encontrado (mock).");
    } catch (err: any) {
      setError(err?.message ?? "Erro ao buscar centro (mock)");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => setData(null), []);

  return { data, loading, error, fetchById, clear, setData };
}
