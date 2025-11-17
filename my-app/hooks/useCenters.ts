// src/hooks/useCenters.ts
import { useCallback, useEffect, useState } from "react";

export type CenterSummary = {
  id_centro: number;
  nome_centro: string;
  descricao?: string | null;
  telefone?: string | null;
  email?: string | null;
  id_organizacao?: number | null;
  id_endereco?: number | null;
  thumbnail?: string | null;
};

const MOCK_RESPONSE: CenterSummary[] = [
  {
    id_centro: 1,
    nome_centro: "Centro Comunitário Navegantes",
    descricao: "Espaço comunitário destinado ao acolhimento de famílias desalojadas pelas enchentes.",
    telefone: "(51) 3345-8721",
    email: "centrocnavegantes@gmail.com",
    id_organizacao: 10,
    id_endereco: 101,
    thumbnail: "https://images.unsplash.com/photo-1506765515384-028b60a970df",
  },
  {
    id_centro: 2,
    nome_centro: "Ginásio da Restinga",
    descricao: "Estrutura esportiva adaptada para receber moradores desalojados.",
    telefone: "(51) 3267-4450",
    email: null,
    id_organizacao: 11,
    id_endereco: 102,
    thumbnail: "https://images.unsplash.com/photo-1523731407965-2430cd12f5e4",
  },
];

export default function useCenters() {
  const [data, setData] = useState<CenterSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCenters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 350));
      // **mock API response** já pronto
      setData(MOCK_RESPONSE);
      return MOCK_RESPONSE;
    } catch (err: any) {
      setError(err?.message ?? "Erro ao buscar centros");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCenters().catch(() => {});
  }, [fetchCenters]);

  const refresh = useCallback(async () => fetchCenters(), [fetchCenters]);

  return { data, loading, error, refresh, setData };
}
