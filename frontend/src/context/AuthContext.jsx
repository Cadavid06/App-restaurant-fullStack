import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  loginRequest,
  logoutRequest,
  registerRequest,
  verifyTokenRequest,
} from "../api/auth";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => {
        setErrors([]);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [errors]);

  useEffect(() => {
    async function checkLogin() {
      try {
        const res = await verifyTokenRequest();

        if (res.data) {
          setIsAuthenticated(true);
          setUser(res.data);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.log(
          "[AuthContext] Verification failed:",
          error.response?.status,
          error.response?.data
        );
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkLogin();
  }, []);

  const signUp = async (user) => {
    try {
      setLoading(true);
      setErrors([]);
      const res = await registerRequest(user);
      setUser(res.data.user); // ✅ Asegúrate de extraer el user correctamente
      setIsAuthenticated(true);

      // ✅ Navegar según el rol y restaurant_id
      navigateByRole(res.data.user);
    } catch (error) {
      console.error("Registration error:", error);
      setErrors(error.response?.data || ["Unexpected error"]);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (data) => {
    try {
      setLoading(true);
      const res = await loginRequest(data);
      setUser(res.data.user);
      setIsAuthenticated(true);

      // ✅ Navegar según el rol y restaurant_id
      navigateByRole(res.data.user);
    } catch (error) {
      console.error("[AuthContext] Login error:", error);
      setErrors(error.response?.data || ["Unexpected error"]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Función helper para navegar según el usuario
  const navigateByRole = (userData) => {
    const { role, restaurant_id } = userData; // Asegúrate de usar role_id o role según tu API

    // 1. DEVELOPER (Rol 3)
    if (role === 3) {
      navigate("/restaurants");
      return;
    }

    // 2. ADMIN DE RESTAURANTE (Rol 1)
    if (role === 1) {
      navigate("/dashboard");
      return;
    }

    // 3. EMPLEADO (Rol 2)
    if (role === 2) {
      navigate("/menu");
      return;
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
      setUser(null);
      setIsAuthenticated(false);
      setErrors([]);
      localStorage.removeItem("selectedRestaurantId"); // ✅ Limpiar selección de restaurante
      navigate("/");
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
  );
};

export default AuthContext;
