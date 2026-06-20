import { create } from 'zustand'
import type { AuthUser } from '../types/authTypes'

const ACCESS_TOKEN_KEY = 'fixnow_access_token'
const TOKEN_STORAGE_KEY = 'fixnow_token_storage'

type TokenStorage = 'local' | 'session'

function getStoredToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) ?? sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

function storeToken(accessToken: string, storage: TokenStorage) {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.setItem(TOKEN_STORAGE_KEY, storage)
  const target = storage === 'local' ? localStorage : sessionStorage
  target.setItem(ACCESS_TOKEN_KEY, accessToken)
}

function clearStoredToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

type AuthState = {
  accessToken: string | null
  user: AuthUser | null
  isInitialized: boolean
  setSession: (accessToken: string, user: AuthUser, remember?: boolean) => void
  updateAccessToken: (accessToken: string) => void
  setUser: (user: AuthUser) => void
  clearSession: () => void
  markInitialized: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: getStoredToken(),
  user: null,
  isInitialized: false,
  setSession: (accessToken, user, remember = false) => {
    storeToken(accessToken, remember ? 'local' : 'session')
    set({ accessToken, user, isInitialized: true })
  },
  updateAccessToken: (accessToken) => {
    const storage = localStorage.getItem(TOKEN_STORAGE_KEY) === 'local' ? 'local' : 'session'
    storeToken(accessToken, storage)
    set({ accessToken })
  },
  setUser: (user) => set({ user }),
  clearSession: () => {
    clearStoredToken()
    set({ accessToken: null, user: null, isInitialized: true })
  },
  markInitialized: () => set({ isInitialized: true }),
}))

export const getAccessToken = () => useAuthStore.getState().accessToken
export const setRefreshedAccessToken = (token: string) =>
  useAuthStore.getState().updateAccessToken(token)
export const clearAuthSession = () => useAuthStore.getState().clearSession()
