// src/hooks/useActiveEmergencies.ts
import { useData } from "@/context/DataContext";
import { useCallback, useEffect, useState } from "react";

export type ActiveEmergency = {
  id_emergencia: number;
  titulo: string;
  subtitulo?: string;
  descricao?: string;
  id_endereco?: number | null;
  data_inicio?: string | null;
  data_fim?: string | null;
  urgencia?: string | null;
  status?: string | null;
  id_usuario?: number | null;
  imagem?: string | null;
};

export default function useActiveEmergencies() {
  const [data, setData] = useState<ActiveEmergency[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { emergencias } = useData();

  const fetchEmergencies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // simulate network latency
      await new Promise((r) => setTimeout(r, 500));
      // **mock API response** (já pronto)
      const activeEmergency: ActiveEmergency[] = emergencias.filter(
        (e) => e.status == "ativa",
      ) as ActiveEmergency[];
      setData(activeEmergency);
      return emergencias;
    } catch (err: any) {
      setError(err?.message ?? "Erro ao buscar emergências");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmergencies().catch(() => {});
  }, [fetchEmergencies]);

  const refresh = useCallback(
    async () => fetchEmergencies(),
    [fetchEmergencies],
  );

  return { data, loading, error, fetchEmergencies, refresh, setData };
}
