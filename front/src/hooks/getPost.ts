import api from '@/services/api'
import { useQuery, UseQueryResult } from '@tanstack/react-query'

export interface Publicidade {
  _id?: string;
  id_emergencia?: string;
  id_centro?: string;
  titulo?: string;
  descricao?: string;
  data_criacao?: Date;
  data_validade?: Date;
  status?: string;
  image?: string;
  timeLabel?: string;
  centro?: any[]; // referência
  necessidades?: any[];
  usuario?: any;
  usuario_id?: string;
}
export const getPost = async (): Promise<Publicidade[]> => {
  const { data } = await api.get<Publicidade[]>('/api/v1/publicacao/publicidades')
  return data
}
