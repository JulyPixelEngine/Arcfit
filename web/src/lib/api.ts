import axios from "axios"

const SESSION_KEY = "session_login_at"
const SESSION_DURATION = 60 * 60 * 1000 // 1 hour

export function saveSession() {
  localStorage.setItem(SESSION_KEY, Date.now().toString())
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

function isSessionExpired(): boolean {
  const loginAt = localStorage.getItem(SESSION_KEY)
  if (!loginAt) return false
  return Date.now() - parseInt(loginAt) > SESSION_DURATION
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined" && isSessionExpired()) {
    clearSession()
    window.location.href = "/login?session=expired"
    return Promise.reject(new Error("Session expired"))
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      clearSession()
      window.location.href = "/login"
    }
    return Promise.reject(err)
  }
)

export default api
