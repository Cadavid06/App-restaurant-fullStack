import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { Button } from "../../components/ui/button";
import { Edit, Trash2, Plus } from "lucide-react";
import UserModal from "../../components/users/UserModal";

function UsersPage() {
  const { users, getUsers, deleteUser, errors } = useUser();
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    getUsers();
  }, []);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("¿Eliminar usuario?")) {
      await deleteUser(id);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 space-y-4 md:space-y-6">
      {/* ✅ Padding adaptativo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        {/* ✅ Stack en móviles */}
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          {/* ✅ Tamaño adaptativo */}
          Gestión de Usuarios
        </h1>
        <Button
          onClick={() => {
            setSelectedUser(null);
            setOpen(true);
          }}
          className="text-sm md:text-base w-full md:w-auto" // ✅ Ancho y tamaño adaptativo
        >
          + Agregar Usuario
        </Button>
      </div>
      {errors.length > 0 && (
        <div className="space-y-2">
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
      <div className="overflow-x-auto">
        {/* ✅ Scroll horizontal */}
        <table className="w-full border-collapse min-w-[100px]">
          {/* ✅ Min width para scroll */}
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gray-700">
                {/* ✅ Padding adaptativo */}
                Nombre
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">
                {/* ✅ Oculta en móviles */}
                Email
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gray-700 hidden sm:table-cell">
                {/* ✅ Oculta en móviles pequeños */}
                Rol
              </th>
              <th className="px-4 md:px-6 py-3 text-right text-sm font-semibold text-gray-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.user_id || index} className="border-t">
                <td className="px-4 md:px-6 py-4 text-sm md:text-base">
                  {user.name}
                </td>
                {/* ✅ Tamaño adaptativo */}
                <td className="px-4 md:px-6 py-4 text-gray-700 hidden md:table-cell text-sm md:text-base">
                  {user.email}
                </td>
                {/* ✅ Oculta en móviles */}
                <td className="px-4 md:px-6 py-4 text-gray-700 hidden sm:table-cell text-sm md:text-base">
                  {/* ✅ Oculta en móviles pequeños */}
                  {user.role_id === 1 ? "Admin" : "Empleado"}
                </td>
                <td className="px-4 md:px-6 py-4 text-right">
                  <div className="flex justify-end gap-1 md:gap-2">
                    {/* ✅ Gap adaptativo */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(user.user_id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <UserModal
        open={open}
        onClose={() => {
          setOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </div>
  );
}

export default UsersPage;
