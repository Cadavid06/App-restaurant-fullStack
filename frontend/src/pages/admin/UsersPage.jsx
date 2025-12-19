import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useAuth } from "../../context/AuthContext";
import { useRestaurant } from "../../context/RestaurantContext";
import { Button } from "../../components/ui/button";
import { Edit, Trash2, Building2, Mail, User } from "lucide-react"; // Añadí iconos para móvil
import UserModal from "../../components/users/UserModal";
import {
  showSuccess,
  showError,
  showDeleteConfirm,
} from "../../utils/sweetAlert";

function UsersPage() {
  const { user: currentUser } = useAuth();
  const { users, getUsers, deleteUser, errors } = useUser();
  const { restaurants, getRestaurants } = useRestaurant();

  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const isDeveloper = currentUser?.role === 3;

  useEffect(() => {
    getUsers();
    if (isDeveloper) {
      getRestaurants();
    }
  }, [isDeveloper]);

  const getRestaurantName = (id) => {
    if (!id) return "N/A";
    const rest = restaurants.find((r) => r.restaurant_id === id);
    return rest ? rest.name : `ID: ${id}`;
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (await showDeleteConfirm("usuario")) {
      try {
        await deleteUser(id);
        showSuccess("Usuario Eliminado");
      } catch (error) {
        showError("Error", "No se pudo eliminar.");
      }
    }
  };

  return (
    // ✅ 1. Contenedor con ancho controlado igual que AdminPage
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4 w-full max-w-[90vw] sm:max-w-4/5 lg:max-w-3/4 mx-auto h-auto box-border">
      {" "}
      {/* ✅ 2. Header Responsivo (Stack en móvil, Row en escritorio) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="h-6 w-6 text-gray-700" />
            {isDeveloper ? "Gestión Global" : "Personal"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isDeveloper
              ? "Administra los usuarios de todos los restaurantes"
              : "Gestiona el equipo de tu restaurante"}
          </p>
        </div>

        {/* ✅ 3. Botón Full Width en móvil */}
        <Button
          onClick={() => {
            setSelectedUser(null);
            setOpen(true);
          }}
          className="bg-black text-white hover:bg-gray-800 w-full md:w-auto transition-all"
        >
          + Nuevo Usuario
        </Button>
      </div>
      {/* Mensajes de Error */}
      {errors.length > 0 && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
          {errors.map((e, i) => (
            <div key={i}>{e}</div>
          ))}
        </div>
      )}
      {/* ✅ 4. Tabla Responsiva */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {/* 'overflow-x-auto' habilita el deslizamiento. 'w-full' asegura que use el espacio. */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                {/* 'whitespace-nowrap' es la clave: impide que el texto se parta en dos líneas */}
                <th className="px-6 py-3 whitespace-nowrap">Nombre</th>
                <th className="hidden md:table-cell px-6 py-3 whitespace-nowrap">
                  Email
                </th>
                <th className="px-6 py-3 whitespace-nowrap">Rol</th>

                {isDeveloper && (
                  <th className="px-6 py-3 whitespace-nowrap">Restaurante</th>
                )}

                <th className="px-6 py-3 text-right whitespace-nowrap">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.isArray(users) && users.length > 0 ? (
                users.map((u) => (
                  <tr
                    key={u.user_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Nombre + Email (solo móvil) */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{u.name}</div>

                      {/* ✅ Aquí mostramos el email solo en pantallas pequeñas */}
                      <div className="md:hidden text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {u.email}
                      </div>
                    </td>

                    {/* Email (solo Desktop) */}
                    <td className="hidden md:table-cell px-6 py-4 text-gray-600 whitespace-nowrap">
                      {u.email}
                    </td>

                    {/* Rol */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                        ${
                          u.role_id === 1
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {u.role_id === 1 ? "Admin" : "Empleado"}
                      </span>
                    </td>

                    {/* Restaurante (Developer) */}
                    {isDeveloper && (
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {getRestaurantName(u.restaurant_id)}
                        </div>
                      </td>
                    )}

                    {/* Acciones */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(u)}
                          className="hover:bg-gray-100"
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(u.user_id)}
                          className="hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={isDeveloper ? 5 : 4}
                    className="px-6 py-8 text-center text-gray-500 bg-gray-50"
                  >
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <UserModal
        open={open}
        onClose={() => {
          setOpen(false);
          getUsers();
        }}
        user={selectedUser}
      />
    </div>
  );
}

export default UsersPage;
