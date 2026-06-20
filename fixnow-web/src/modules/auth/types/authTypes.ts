import type { UserRole } from '../../../shared/constants/roles'

export type AuthUser = {
  id: string
  _id?: string
  fullName: string
  email: string
  phone?: string
  avatar?: string | null
  role: UserRole
  status?: 'ACTIVE' | 'INACTIVE' | 'BANNED'
  isEmailVerified?: boolean
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  fullName: string
  phone: string
  email: string
  password: string
}

export type LoginResponse = {
  message: string
  accessToken: string
  user: AuthUser
}

export type ProfileResponse = {
  message: string
  user: AuthUser
}
