import { createContext, useContext, useEffect, useState } from 'react'
import { getMe, loginUser, logoutUser, registerUser } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on page load
  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  // Listen for 401 events from the Axios interceptor
  useEffect(() => {
    const handler = () => setUser(null)
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [])

  const login = async (credentials) => {
    const u = await loginUser(credentials)
    setUser(u)
    return u
  }

  const logout = async () => {
    await logoutUser().catch(() => {})
    setUser(null)
  }

  const register = async (data) => {
    const u = await registerUser(data)
    // Auto-login after register
    return login({ username: data.username, password: data.password })
  }

  const isAdmin = () => user?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
