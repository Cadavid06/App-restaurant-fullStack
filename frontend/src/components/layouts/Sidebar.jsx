"use client";

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Package,
  Users,
  BarChart3,
  Utensils,
  X,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const adminMenuItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/menu", label: "Tomar Pedido", icon: ShoppingCart },
    { path: "/orders", label: "Pedidos", icon: ClipboardList },
    { path: "/products", label: "Productos", icon: Package },
    { path: "/users", label: "Usuarios", icon: Users },
    { path: "/reports", label: "Reportes", icon: BarChart3 },
  ];

  const employeeMenuItems = [
    { path: "/menu", label: "Menú", icon: Utensils },
    { path: "/orders", label: "Pedidos", icon: ClipboardList },
  ];

  const menuItems = user?.role === 1 ? adminMenuItems : employeeMenuItems;
  const roleLabel = user?.role === 1 ? "Administrador" : "Empleado";

  return (
    <>
      {/* ✅ Sidebar fijo (visible en md y arriba) */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-40
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Restaurante</h1>
            <p className="text-sm text-gray-500 mt-1">{roleLabel}</p>
          </div>

          {/* ✅ Botón de cerrar (solo visible en móviles) */}
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <nav className="p-4">
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
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* ✅ Overlay oscuro al abrir menú (solo móvil) */}
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
