import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { type SessionUser, getSession, clearSession } from './session'

interface AuthContextValue {
  user: SessionUser | null
  isAuthenticated: boolean
  setUser: (user: SessionUser | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<SessionUser | null>(() => {
    return getSession()?.user ?? null
  })

  useEffect(() => {
    const session = getSession()
    if (!session) setUser(null)
  }, [])

  function logout(): void {
    clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
