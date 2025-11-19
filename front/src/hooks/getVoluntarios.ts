import api from '@/services/api'
import { useQuery, UseQueryResult } from '@tanstack/react-query'

export interface Usuario {
  _id: string;
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  perfil: any;
  id_endereco?: any;
  data_criacao?: Date;
  image?: string;
}
export const getAllVoluntarios = async (): Promise<Usuario[]> => {
  const { data } = await api.get<Usuario[]>('/api/v1/usuarios')
  return data
}
