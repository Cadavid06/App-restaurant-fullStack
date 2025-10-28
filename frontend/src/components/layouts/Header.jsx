"use client";

import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 md:left-64 z-50 shadow-sm">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* ✅ Botón hamburguesa solo móvil */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        {/* ✅ Texto Bienvenida */}
        <p className="text-gray-900 font-medium text-sm sm:text-base truncate flex-1 text-center md:text-left">
          Bienvenido {user?.name || user?.username}
        </p>

        {/* ✅ Botón Cerrar sesión */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="flex items-center gap-2 bg-transparent text-sm"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </Button>
      </div>
    </header>
  );
};

export default Header;
