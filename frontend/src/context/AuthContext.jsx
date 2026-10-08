import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authService } from '../services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {

  // TEMP USER FOR TESTING
  const [user, setUser] = useState({
    id: 1,
    full_name: 'Sam',
    username: 'sam',
    email: 'sam@gmail.com',
    role: 'admin'
  })

  const [loading, setLoading] = useState(false)

  const loadUser = useCallback(async () => {
    return
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (email, password) => {
    const fakeUser = {
      id: 1,
      full_name: 'Sam',
      username: 'sam',
      email: email,
      role: 'admin'
    }

    setUser(fakeUser)
    return { user: fakeUser }
  }

  const register = async (formData) => {
    const fakeUser = {
      id: 1,
      full_name: formData.full_name || 'Sam',
      username: formData.username || 'sam',
      email: formData.email,
      role: 'admin'
    }

    setUser(fakeUser)
    return { user: fakeUser }
  }

  const logout = () => {
    setUser(null)
  }

  const updateUser = (updated) => {
    setUser(updated)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}