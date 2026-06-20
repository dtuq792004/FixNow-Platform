export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  PROVIDER: 'PROVIDER',
  ADMIN: 'ADMIN',
} as const

export type UserRole = (typeof ROLES)[keyof typeof ROLES]
