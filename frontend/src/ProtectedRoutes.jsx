import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "./context/AuthContext"

function ProtectedRoutes({ allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="text-center mt-10">Verificando sesión...</div>
  }

  // 1. NO AUTENTICADO
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // 2. ROL NO PERMITIDO
  if (!allowedRoles.includes(user?.role)) {
    // Redirigir a su página principal según su rol
    if (user?.role === 1) return <Navigate to="/dashboard" replace />
    if (user?.role === 2) return <Navigate to="/menu" replace />
    return <Navigate to="/" replace /> // Por si el rol es desconocido o null
  }

  // 3. TODO OK: CONTINÚA a la ruta anidada
  return <Outlet />
}

export default ProtectedRoutes