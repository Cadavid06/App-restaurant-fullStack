"use client";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useRestaurant } from "../../context/RestaurantContext";
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Package,
  Users,
  BarChart3,
  Utensils,
  Building2,
  ArrowLeftCircle,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { currentRestaurant, clearRestaurantSelection } = useRestaurant();
  const location = useLocation();
  const navigate = useNavigate();

  // ... (Tus arrays de menú quedan igual) ...
  const developerMenuItems = [
    { path: "/restaurants", label: "Restaurantes", icon: Building2 },
    { path: "/users", label: "Gestión Global Usuarios", icon: Users },
  ];

  const adminMenuItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/menu", label: "Tomar Pedido", icon: ShoppingCart },
    { path: "/orders", label: "Pedidos", icon: ClipboardList },
    { path: "/products", label: "Productos", icon: Package },
    { path: "/users", label: "Personal", icon: Users },
    { path: "/reports", label: "Reportes", icon: BarChart3 },
  ];

  const employeeMenuItems = [
    { path: "/menu", label: "Menú", icon: Utensils },
    { path: "/orders", label: "Pedidos", icon: ClipboardList },
  ];

  let menuItems = [];
  let roleLabel = "";

  const isDeveloper = user?.role === 3;

  if (isDeveloper) {
    if (currentRestaurant) {
      menuItems = adminMenuItems;
      roleLabel = `Supervisando: ${currentRestaurant.name}`;
    } else {
      menuItems = developerMenuItems;
      roleLabel = "Super Admin (Global)";
    }
  } else if (user?.role === 1) {
    menuItems = adminMenuItems;
    roleLabel = "Administrador";
  } else {
    menuItems = employeeMenuItems;
    roleLabel = "Empleado";
  }

  const handleExitRestaurant = () => {
    clearRestaurantSelection();
    navigate("/restaurants");
    onClose();
  };

  return (
    <>
      <aside
        className={`fixed top-16 md:top-0 left-0 h-[calc(100vh-4rem)] md:h-screen w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header del Sidebar (Fijo arriba) */}
        <div className="p-6 border-b border-gray-200 shrink-0">
          <h1 className="text-xl font-bold text-gray-900">
            {isDeveloper && !currentRestaurant
              ? "Panel Developer"
              : "Restaurante"}
          </h1>
          <p className="text-sm text-gray-500 mt-1 truncate">{roleLabel}</p>
        </div>

        {/* Cuerpo del Menú (Scrollable si es muy largo) */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${
                        isActive
                          ? "bg-gray-100 text-gray-900 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer del Sidebar (Botón Salir - Fijo abajo) */}
        {isDeveloper && currentRestaurant && (
          <div className="p-4 border-t border-gray-200 bg-white shrink-0">
            <button
              onClick={handleExitRestaurant}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors font-medium justify-center md:justify-start"
            >
              <ArrowLeftCircle className="w-5 h-5 shrink-0" />
              <span>Volver al Panel</span>
            </button>
          </div>
        )}
      </aside>

      {/* Overlay para móviles */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default Sidebar;
