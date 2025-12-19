import { Building2, ChevronDown } from "lucide-react";
import { useRestaurant } from "../../context/RestaurantContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

function RestaurantHeader() {
  const { user } = useAuth();
  const { currentRestaurant, clearRestaurantSelection } = useRestaurant();
  const navigate = useNavigate();

  // No mostrar nada si no es Developer o si no hay restaurante seleccionado
  if (user?.role !== 1 || !currentRestaurant) {
    return null;
  }

  const handleChangeRestaurant = () => {
    clearRestaurantSelection();
    navigate("/restaurants");
  };

  return (
    <div className="bg-blue-50 border-b border-blue-100 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 text-blue-600" />
          <span className="text-gray-600">Viendo:</span>
          <span className="font-semibold text-gray-900">
            {currentRestaurant.name}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleChangeRestaurant}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
        >
          Cambiar Restaurante
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

export default RestaurantHeader;
