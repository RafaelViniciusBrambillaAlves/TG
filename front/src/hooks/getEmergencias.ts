import api from '@/services/api'
import { useQuery, UseQueryResult } from '@tanstack/react-query'

export interface Emergencia {
  _id?: string;
  titulo: string;
  subtitulo?: string | null;
  descricao?: string | null;
  data_inicio?: Date | null;
  data_fim?: Date | null;
  urgencia?: string | null;
  status?: string | null;
  id_usuario?: any ;
  createdAt?: Date;
  updatedAt?: Date;
  cep?: String;
  numero?: number;
  address?: string;
  authorName?: string;
  helpingOrgs?: Array<string> | null;
  image?: string;
}

export const getEmergencias = async (): Promise<Emergencia[]> => {
  const { data } = await api.get<Emergencia[]>('/api/v1/emergencias/emergencias')
  return data
}
