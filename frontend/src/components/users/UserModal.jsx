import { useForm } from "react-hook-form";
import { useUser } from "../../context/UserContext";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { X } from "lucide-react";

function UserModal({ open, onClose, user }) {
  const { updateUser, errors } = useUser();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors: formErrors },
  } = useForm();

  useEffect(() => {
    if (user) {
      setValue("name", user.name);
      setValue("email", user.email);
      setValue("role", user.role_id === 1 ? "Admin" : "Empleado");
    }
  }, [user, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (user) {
        await updateUser(user.user_id, data);
      }
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {" "}
      {/* ✅ Padding para móviles */}
      <div className="bg-white rounded-2xl p-4 md:p-6 w-full max-w-[400px]">
        {" "}
        {/* ✅ Ancho máximo, padding adaptativo */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl font-bold">
            {user ? "Editar Usuario" : "Crear Usuario"}
          </h2>{" "}
          {/* ✅ Tamaño adaptativo */}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        {errors.length > 0 && (
          <div className="space-y-2 mb-4">
            {errors.map((error, i) => (
              <div
                key={i}
                className="bg-red-500 text-white text-sm p-2 rounded-md"
              >
                {error}
              </div>
            ))}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-md text-sm md:text-base" // ✅ Tamaño adaptativo
              {...register("name", { required: "Nombre obligatorio" })}
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm">{formErrors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-md text-sm md:text-base" // ✅ Tamaño adaptativo
              {...register("email", { required: "Email obligatorio" })}
            />
            {formErrors.email && (
              <p className="text-red-500 text-sm">{formErrors.email.message}</p>
            )}
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Rol
            </label>
            <select
              className="w-full px-4 py-2 border rounded-md text-sm md:text-base"
              {...register("role")}
            >
              {" "}
              {/* ✅ Tamaño adaptativo */}
              <option value="Empleado">Empleado</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contraseña (opcional)
            </label>
            <input
              type="password"
              placeholder="Deja vacío para no cambiar"
              className="w-full px-4 py-2 border rounded-md text-sm md:text-base" // ✅ Tamaño adaptativo
              {...register("password")}
            />
            {formErrors.password && (
              <p className="text-red-500 text-sm">
                {formErrors.password.message}
              </p>
            )}
          </div>

          <div className="flex flex-col md:flex-row justify-end gap-3">
            {" "}
            {/* ✅ Stack en móviles */}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full md:w-auto"
            >
              Cancelar
            </Button>
            <Button type="submit" className="w-full md:w-auto">
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserModal;
