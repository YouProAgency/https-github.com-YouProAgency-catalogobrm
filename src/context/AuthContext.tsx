import React, { createContext, useContext, useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { RecordModel } from 'pocketbase'

interface AuthContextType {
  user: RecordModel | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<RecordModel>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<RecordModel | null>(pb.authStore.record)
  const [token, setToken] = useState<string | null>(pb.authStore.token)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Escuta mudanças no authStore do PocketBase (login, logout, token refresh)
    const unsubscribe = pb.authStore.onChange((tokenVal, model) => {
      setToken(tokenVal)
      setUser(model)
    })

    // Se já houver token salvo, valida com a API authRefresh para garantir validade
    const validateExistingAuth = async () => {
      if (pb.authStore.isValid) {
        try {
          await pb.collection('users').authRefresh()
          setUser(pb.authStore.record)
          setToken(pb.authStore.token)
        } catch (err) {
          console.warn('Sessão expirada ou inválida, limpando credenciais:', err)
          pb.authStore.clear()
          setUser(null)
          setToken(null)
        }
      }
      setIsLoading(false)
    }

    validateExistingAuth()

    return () => {
      unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    const authData = await pb.collection('users').authWithPassword(email.trim(), password)
    setUser(authData.record)
    setToken(authData.token)
    return authData.record
  }

  const logout = () => {
    pb.authStore.clear()
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider')
  }
  return context
}
