import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRestaurant } from "../../context/RestaurantContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { showSuccess, showError } from "../../utils/sweetAlert";

function RestaurantModal({ open, onClose, restaurant }) {
  const { createRestaurant, updateRestaurant } = useRestaurant();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (restaurant) {
      reset({
        name: restaurant.name,
        address: restaurant.address || "",
        phone: restaurant.phone || "",
        is_active: restaurant.is_active !== false,
      });
    } else {
      reset({
        name: "",
        address: "",
        phone: "",
        is_active: true,
      });
    }
  }, [restaurant, reset, open]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (restaurant) {
        // Actualizar
        await updateRestaurant(restaurant.restaurant_id, data);
        showSuccess(
          "Restaurante Actualizado",
          `${data.name} ha sido actualizado correctamente.`
        );
      } else {
        // Crear
        await createRestaurant(data);
        showSuccess(
          "Restaurante Creado",
          `${data.name} ha sido creado correctamente.`
        );
      }
      onClose();
    } catch (error) {
      const msg =
        error.response?.data?.message || "Error al guardar el restaurante";
      showError("Error", msg);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {restaurant ? "Editar Restaurante" : "Nuevo Restaurante"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Restaurante *
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Ej: Restaurante Central"
              {...register("name", {
                required: "El nombre es obligatorio",
                minLength: {
                  value: 3,
                  message: "El nombre debe tener al menos 3 caracteres",
                },
              })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Ej: Calle 123 #45-67"
              {...register("address")}
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Ej: 3001234567"
              {...register("phone", {
                pattern: {
                  value: /^[0-9+\-() ]+$/,
                  message: "Teléfono inválido",
                },
              })}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Estado */}
          {restaurant && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                {...register("is_active")}
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                Restaurante activo
              </label>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-black text-white hover:bg-gray-800"
            >
              {restaurant ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RestaurantModal;
