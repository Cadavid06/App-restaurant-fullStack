import { createContext, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { loginRequest, logoutRequest, registerRequest, verifyTokenRequest } from "../api/auth"

export const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [errors, setErrors] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => {
        setErrors([])
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [errors])

  useEffect(() => {
    async function checkLogin() {
      try {
        const res = await verifyTokenRequest()

        if (res.data) {
          setIsAuthenticated(true)
          setUser(res.data)
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch (error) {
        console.log("[v0] AuthContext - Verification failed:", error.response?.status, error.response?.data)
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkLogin()
  }, [])

  const signUp = async (user) => {
    try {
      setLoading(true)
      setErrors([])
      const res = await registerRequest(user)
      setUser(res.data)
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Registration error:", error)
      setErrors(error.response?.data || ["Unexpected error"])
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (data) => {
    try {
      setLoading(true)
      const res = await loginRequest(data)
      setUser(res.data.user)
      setIsAuthenticated(true)

      if (res.data.user.role === 1) {
        navigate("/dashboard")
      } else if (res.data.user.role === 2) {
        navigate("/menu")
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      setErrors(error.response?.data || ["Unexpected error"])
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      const res = logoutRequest();
      setUser(null);
      setIsAuthenticated(false);
      setErrors([]);
    } catch (error) {
      console.error("Error al hacer logout:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signUp,
        signIn,
        logout,
        user,
        errors,
        isAuthenticated,
        loading,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
