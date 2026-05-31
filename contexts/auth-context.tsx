"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
}

interface SavedModel {
  id: string
  name: string
  prompt: string
  modelUrl: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  saveModel: (model: { name: string; prompt: string; modelUrl: string }) => Promise<{
    success: boolean
    error?: string
  }>
  getSavedModels: () => Promise<SavedModel[]>
  deleteModel: (id: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem("auth_token")
    if (token) {
      fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUser(data.user)
          } else {
            localStorage.removeItem("auth_token")
          }
        })
        .catch(() => {
          localStorage.removeItem("auth_token")
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log("[v0] Login attempt:", email)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      console.log("[v0] Login response:", data)

      if (data.success) {
        localStorage.setItem("auth_token", data.token)
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error("[v0] Login network error:", error)
      return { success: false, error: "Network error - please check your connection" }
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    try {
      console.log("[v0] Signup attempt:", email)
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()
      console.log("[v0] Signup response:", data)

      if (data.success) {
        localStorage.setItem("auth_token", data.token)
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error("[v0] Signup network error:", error)
      return { success: false, error: "Network error - please check your connection" }
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    setUser(null)
  }

  const saveModel = async (model: { name: string; prompt: string; modelUrl: string }) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        return { success: false, error: "Not authenticated" }
      }

      const response = await fetch("/api/models/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(model),
      })

      const data = await response.json()
      return data
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  const getSavedModels = async (): Promise<SavedModel[]> => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        return []
      }

      const response = await fetch("/api/models/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      return data.success ? data.models : []
    } catch (error) {
      return []
    }
  }

  const deleteModel = async (id: string) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        return { success: false, error: "Not authenticated" }
      }

      const response = await fetch(`/api/models/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      return data
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  if (isLoading) {
    return null // or loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        saveModel,
        getSavedModels,
        deleteModel,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
