import { create } from "zustand"

interface AuthState {
  token: string | null
  studioId: string | null
  isAuthenticated: boolean
  setToken: (token: string, studioId: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("access_token"),
  studioId: localStorage.getItem("studio_id"),
  isAuthenticated: !!localStorage.getItem("access_token"),
  setToken: (token, studioId) => {
    localStorage.setItem("access_token", token)
    localStorage.setItem("studio_id", studioId)
    set({ token, studioId, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("studio_id")
    set({ token: null, studioId: null, isAuthenticated: false })
  },
}))
