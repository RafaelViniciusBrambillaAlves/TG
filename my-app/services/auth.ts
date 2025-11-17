export const AUTH_TOKEN_TIME = 60 * 60 * 72 // 3 dias
export type SignInData = {
  email: string
  password: string
  token?: string
}

import api from './api'
import { UserProfile } from '@/hooks/useLogin'

export type SignInRequestData = {
  email: string
  password: string
}

export type signInRequestResult = {
  token: string
  data: {
    user: UserProfile
    token: string
  }
}

export type SignUpRequestData = {
  name: string
  password_confirmation: string
} & SignInRequestData

const delay = (amount = 750) =>
  new Promise(resolve => setTimeout(resolve, amount))

export async function signInRequest(
  signInData: SignInData
): Promise<signInRequestResult> {
  const { data } = await api.post<signInRequestResult>('/api/v1/usuarios/login', signInData)
  return data
}

export async function signUpRequest(signUpData: SignUpRequestData) {
  const { data } = await api.post<string>('/api/v1/usuarios/login/register', signUpData)
  return data
}

export async function recoverUserInformation() {
  await delay()

  return {
    user: {
      name: 'test',
      email: 'test@test.com.br',
      avatar_url: 'test.png'
    }
  }
}
