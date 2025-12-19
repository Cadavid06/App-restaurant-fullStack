import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import { useRestaurant } from "../../context/RestaurantContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { showSuccess, showError } from "../../utils/sweetAlert";
import { registerRequest } from "../../api/auth";

function UserModal({ open, onClose, user }) {
  const { user: currentUser } = useAuth();
  const { updateUser, getUsers } = useUser();
  const { restaurants, getRestaurants } = useRestaurant();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // ✅ Validar con ROL 3
  const isDeveloper = currentUser?.role === 3;

  // Cargar restaurantes si es Developer y abre el modal
  useEffect(() => {
    if (open && isDeveloper) {
      getRestaurants();
    }
  }, [open, isDeveloper]);

  useEffect(() => {
    if (user) {
      // EDICIÓN
      reset({
        name: user.name,
        email: user.email,
        role: user.role_id === 1 ? "Administrador" : "Empleado",
        restaurant_id: user.restaurant_id, // Cargar su restaurante actual
        password: "",
      });
    } else {
      // CREACIÓN
      reset({
        name: "",
        email: "",
        password: "",
        // Developer crea Admins por defecto, Admins crean Empleados por defecto
        role: isDeveloper ? "Administrador" : "Empleado",

        // Developer: Campo vacío (debe seleccionar). Admin: Su propio ID (automático).
        restaurant_id: isDeveloper ? "" : currentUser.restaurant_id,
      });
    }
  }, [user, reset, isDeveloper, currentUser]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        // Si es developer usa el select, si no, usa el ID del admin logueado
        restaurant_id: isDeveloper
          ? Number(data.restaurant_id)
          : currentUser.restaurant_id,
      };

      if (!userData.password) delete userData.password;

      if (user) {
        await updateUser(user.user_id, userData);
        showSuccess("Usuario Actualizado");
      } else {
        await registerRequest(userData);
        showSuccess("Usuario Creado");
      }

      getUsers();
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message || "Error al guardar usuario";
      showError("Error", msg);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              {...register("name", { required: true })}
            />
            {errors.name && (
              <span className="text-red-500 text-sm">Requerido</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border p-2 rounded"
              {...register("email", { required: true })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <input
              type="password"
              placeholder={user ? "Sin cambios" : ""}
              className="w-full border p-2 rounded"
              {...register("password", { required: !user })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rol</label>
              <select
                className="w-full border p-2 rounded"
                {...register("role")}
              >
                <option value="Empleado">Empleado</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>

            {/* ✅ SELECTOR DE RESTAURANTE (Solo para Developer) */}
            {isDeveloper && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Restaurante
                </label>
                <select
                  className="w-full border p-2 rounded"
                  {...register("restaurant_id", {
                    required: "Selecciona un restaurante",
                  })}
                >
                  <option value="">-- Seleccionar --</option>
                  {restaurants.map((rest) => (
                    <option key={rest.restaurant_id} value={rest.restaurant_id}>
                      {rest.name}
                    </option>
                  ))}
                </select>
                {errors.restaurant_id && (
                  <span className="text-red-500 text-xs">Requerido</span>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UserModal;
