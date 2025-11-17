// src/hooks/usePublications.ts
import { Necessidade } from "@/app/componets/CenterNeeds";
import { useCallback, useEffect, useState } from "react";

export type NecessidadeMock = {
  id_necessidade: number;
  nome_recurso: string;
  descricao?: string | null;
  quantidade_necessaria?: number | null;
  quantidade_intencao?: number | null;
  tipo_voluntariado?: string | null;
  status?: string | null;
};

export type CentroMini = {
  id_centro: number;
  nome_centro: string;
  telefone?: string | null;
  email?: string | null;
  id_endereco?: number | null;
};

export type PublicationMock = {
  id_postagem: number;
  id_emergencia?: number | null;
  id_centro?: number | null;
  titulo: string;
  descricao?: string | null;
  data_criacao: string;
  data_validade?: string | null;
  status?: string | null;
  timeLabel?: string | null; // ex: "13 h"
  centro: CentroMini | null; // payload pronto já com centro embutido
  necessidades: Necessidade[] | null; // payload pronto já com necessidades
};

const MOCK_RESPONSE: PublicationMock[] = [
  {
    id_postagem: 3001,
    id_emergencia: 1001,
    id_centro: 1,
    titulo: "Kits de Higiene Urgentes 🧴",
    descricao:
      "As famílias precisam de 300 kits de higiene (sabonete, pasta, escova, absorventes). Sua doação pode devolver dignidade a quem perdeu tudo.",
    data_criacao: "2025-10-02T05:00:00Z",
    data_validade: "2025-11-01T00:00:00Z",
    status: "ativa",
    timeLabel: "13 h - Centro Comunitário Navegantes (ONG Porto Solidário)",
    centro: {
      id_centro: 1,
      nome_centro: "Centro Comunitário Navegantes",
      telefone: "(51) 3345-8721",
      email: "centrocnavegantes@gmail.com",
      id_endereco: 101,
    },
    necessidades: [
      {
        id_necessidade: 2001,
        nome_recurso: "Kits de Higiene Pessoal",
        descricao: "Sabonete, escova de dente, pasta, absorventes",
        quantidade_necessaria: 300,
        quantidade_intencao: 12,
        tipo_voluntariado: "doacao",
        status: "aberta",
      },
      {
        id_necessidade: 2002,
        nome_recurso: "Água potável (galões)",
        descricao: "Galões 20L para cozinha coletiva",
        quantidade_necessaria: 50,
        quantidade_intencao: 5,
        tipo_voluntariado: "doacao",
        status: "aberta",
      },
    ],
  },

  {
    id_postagem: 3002,
    id_emergencia: 1001,
    id_centro: 1,
    titulo: "Doe Alimentos Não Perecíveis 🍚",
    descricao:
      "O centro precisa de 1 tonelada de alimentos básicos (arroz, feijão, macarrão, óleo). Ajude a encher os pratos de quem perdeu sua casa.",
    data_criacao: "2025-10-02T03:00:00Z",
    data_validade: "2025-11-30T00:00:00Z",
    status: "ativa",
    timeLabel: "2 h - Cultural Sapopemba (Prefeitura de São Paulo)",
    centro: {
      id_centro: 3,
      nome_centro: "Cultural Sapopemba",
      telefone: "(11) 9999-0000",
      email: "sapopemba@prefeitura.sp.gov.br",
      id_endereco: 201,
    },
    necessidades: [
      {
        id_necessidade: 4001,
        nome_recurso: "Arroz 5kg",
        descricao: "Pacotes 5kg",
        quantidade_necessaria: 200,
        quantidade_intencao: 10,
        tipo_voluntariado: "doacao",
        status: "aberta",
      },
    ],
  },

  {
    id_postagem: 3003,
    id_emergencia: 1002,
    id_centro: 2,
    titulo: "Doe Colchões e Conforto 🛏️",
    descricao:
      "Mais de 200 famílias estão desalojadas. Ajude doando colchões para garantir uma noite de descanso digna.",
    data_criacao: "2025-10-01T22:00:00Z",
    data_validade: "2025-12-01T00:00:00Z",
    status: "ativa",
    timeLabel: "2 h - Ginásio da Restinga (Defesa Civil RS)",
    centro: {
      id_centro: 2,
      nome_centro: "Ginásio da Restinga",
      telefone: "(51) 3267-4450",
      email: null,
      id_endereco: 102,
    },
    necessidades: [
      {
        id_necessidade: 3001,
        nome_recurso: "Colchões de solteiro",
        descricao: "Colchões usados em bom estado / novos",
        quantidade_necessaria: 250,
        quantidade_intencao: 4,
        tipo_voluntariado: "doacao",
        status: "aberta",
      },
    ],
  },
];

export default function usePublications() {
  const [data, setData] = useState<PublicationMock[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPublications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 350)); // mock latency
      // payload pronto da "API"
      setData(MOCK_RESPONSE);
      return MOCK_RESPONSE;
    } catch (err: any) {
      setError(err?.message ?? "Erro ao buscar publicações");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublications().catch(() => {});
  }, [fetchPublications]);

  const refresh = useCallback(async () => fetchPublications(), [fetchPublications]);

  return { data, loading, error, refresh, setData, fetchPublications };
}
