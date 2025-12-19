import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRestaurant } from "../../context/RestaurantContext";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import RestaurantModal from "../../components/restaurants/RestaurantModal";
import {
  showSuccess,
  showError,
  showDeleteConfirm,
} from "../../utils/sweetAlert";

function RestaurantsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    restaurants,
    loading,
    errors,
    getRestaurants,
    deleteRestaurant,
    selectRestaurant,
  } = useRestaurant();

  const [open, setOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  useEffect(() => {
    // Si no hay usuario, no hacemos nada (esperamos auth)
    if (!user) return;

    // ✅ CORRECCIÓN:
    // Si el usuario tiene un restaurante asignado (ej: Carlos), NO debe estar aquí.
    // Lo mandamos a su dashboard.
    if (user.restaurant_id) {
      navigate("/dashboard");
      return;
    }

    // Si es Rol 1 y NO tiene restaurante (Developer), entonces sí cargamos la lista.
    if (user.role === 1 && !user.restaurant_id) {
      getRestaurants();
    }
  }, [user]);

  const handleEdit = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await showDeleteConfirm("restaurante");
    if (confirmed) {
      try {
        await deleteRestaurant(id);
        showSuccess(
          "Restaurante Eliminado",
          "El restaurante y todos sus datos han sido eliminados."
        );
      } catch (error) {
        const msg =
          error.response?.data?.message ||
          "No se pudo eliminar el restaurante.";
        showError("Error", msg);
      }
    }
  };

  const handleEnterRestaurant = (restaurant) => {
    selectRestaurant(restaurant);
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-gray-500">
          Cargando restaurantes...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-7 w-7" />
            Gestión de Restaurantes
          </h1>
          <p className="text-gray-500 text-sm md:text-base mt-1">
            Vista de desarrollador - Gestiona todos los restaurantes del sistema
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedRestaurant(null);
            setOpen(true);
          }}
          className="w-full md:w-auto"
        >
          Nuevo Restaurante
        </Button>
      </div>

      {/* Errores */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, i) => (
            <div
              key={i}
              className="bg-red-500 text-white text-sm p-3 rounded-md"
            >
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Grid de Restaurantes */}
      {restaurants.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">No hay restaurantes registrados</p>
          <Button
            onClick={() => setOpen(true)}
            className="mt-4"
            variant="outline"
          >
            Crear primer restaurante
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.restaurant_id}
              className="border rounded-lg p-5 hover:shadow-lg transition-shadow duration-200 bg-white"
            >
              {/* Header de la tarjeta */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {restaurant.name}
                  </h3>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      restaurant.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {restaurant.is_active ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>

              {/* Información */}
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {restaurant.address && (
                  <p className="flex items-start gap-2">
                    <span className="font-medium">📍</span>
                    <span>{restaurant.address}</span>
                  </p>
                )}
                {restaurant.phone && (
                  <p className="flex items-center gap-2">
                    <span className="font-medium">📞</span>
                    <span>{restaurant.phone}</span>
                  </p>
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-2 pt-3 border-t">
                <Button
                  onClick={() => handleEnterRestaurant(restaurant)}
                  className="flex-1 bg-black text-white hover:bg-gray-800"
                  disabled={!restaurant.is_active}
                >
                  Entrar
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(restaurant)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(restaurant.restaurant_id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <RestaurantModal
        open={open}
        onClose={() => {
          setOpen(false);
          setSelectedRestaurant(null);
          getRestaurants();
        }}
        restaurant={selectedRestaurant}
      />
    </div>
  );
}

export default RestaurantsPage;
