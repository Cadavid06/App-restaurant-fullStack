import { Navigate, Outlet, useLocation } from "react-router-dom"; // 👈 Importar useLocation
import { useAuth } from "../context/AuthContext";
import { useRestaurant } from "../context/RestaurantContext";

function RequireRestaurant() {
  const { user, isLoading } = useAuth();
  const { currentRestaurant } = useRestaurant();
  const location = useLocation(); // 👈 Hook para saber en qué ruta estamos

  if (isLoading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/" replace />;

  const isDeveloper = user.role === 3;

  // ✅ EXCEPCIÓN: Si es Developer y quiere ver la Gestión Global (/users),
  // le permitimos pasar AUNQUE no tenga restaurante seleccionado.
  if (isDeveloper && location.pathname === "/users" && !currentRestaurant) {
    return <Outlet />;
  }

  // Regla Developer estándar: Si no es la excepción y no tiene restaurante -> A la lista
  if (isDeveloper && !currentRestaurant) {
    return <Navigate to="/restaurants" replace />;
  }

  // Regla Admin/Empleado: Si no tienen restaurante asignado -> Error
  if (!isDeveloper && !user.restaurant_id) {
    return (
      <div className="p-6 text-red-700">
        Error crítico: Tu usuario no tiene restaurante asignado.
      </div>
    );
  }

  return <Outlet />;
}

export default RequireRestaurant;
