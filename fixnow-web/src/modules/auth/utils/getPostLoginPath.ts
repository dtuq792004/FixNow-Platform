import { ROLES, type UserRole } from '../../../shared/constants/roles'

const roleHomePaths: Record<UserRole, string> = {
  [ROLES.CUSTOMER]: '/customer/home',
  [ROLES.PROVIDER]: '/provider/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard',
}

export function getPostLoginPath(role: UserRole, requestedPath?: string) {
  if (role === ROLES.PROVIDER) {
    return roleHomePaths[ROLES.PROVIDER]
  }

  if (role === ROLES.CUSTOMER && requestedPath?.startsWith('/customer/')) {
    return requestedPath
  }

  if (role === ROLES.ADMIN && requestedPath?.startsWith('/admin/')) {
    return requestedPath
  }

  return roleHomePaths[role]
}
