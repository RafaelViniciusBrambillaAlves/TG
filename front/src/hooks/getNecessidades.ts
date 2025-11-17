import { Need } from '@/app/mocks'
import api from '@/services/api'

export const getNecessidades = async (): Promise<Need[]> => {
  const { data } = await api.get<Need[]>('/api/v1/necessidades')
  return data
}
