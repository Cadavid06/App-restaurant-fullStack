import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MenuPage from "./pages/user/MenuPage";
import OrdersPage from "./pages/user/OrdersPage";
import UsersPage from "./pages/admin/UsersPage";
import Dashboard from "./pages/admin/Dashboard";
import AdminPage from "./pages/admin/AdminPage";
import ReportsPage from "./pages/admin/ReportsPage";
import RestaurantsPage from "./pages/superAdmin/RestaurantsPage"; // ✅ NUEVO
import { AuthProvider } from "./context/AuthContext";
import { RestaurantProvider } from "./context/RestaurantContext"; // ✅ NUEVO
import { UserProvider } from "./context/UserContext";
import { AdminProvider } from "./context/AdminContext";
import { OrderProvider } from "./context/OrderContext";
import { ReportsProvider } from "./context/ReportsContext";
import ProtectedRoutes from "./ProtectedRoutes";
import RequireRestaurant from "./components/RequireRestaurant"; // ✅ NUEVO
import NotFoundPage from "./pages/NotFoundPage";
import DashboardLayout from "./components/layouts/DashboardLayouts";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RestaurantProvider>
          {" "}
          {/* ✅ NUEVO: Envuelve todo para acceso global */}
          <UserProvider>
            <AdminProvider>
              <OrderProvider>
                <ReportsProvider>
                  <Routes>
                    {/* 🏠 RUTA PÚBLICA */}
                    <Route path="/" element={<LoginPage />} />

                    <Route element={<DashboardLayout />}>
                      {/* 🏢 RUTA EXCLUSIVA DEVELOPER: Gestión de Restaurantes */}
                      <Route element={<ProtectedRoutes allowedRoles={[3]} />}>
                        <Route
                          path="/restaurants"
                          element={<RestaurantsPage />}
                        />
                      </Route>

                      {/* 🔒 RUTAS DEL ADMINISTRADOR (solo admin y super admin) */}
                      {/* ✅ IMPORTANTE: Estas rutas REQUIEREN restaurante seleccionado */}
                      <Route element={<ProtectedRoutes allowedRoles={[1, 3]} />}>
                        <Route element={<RequireRestaurant />}>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/users" element={<UsersPage />} />
                          <Route path="/products" element={<AdminPage />} />
                          <Route path="/reports" element={<ReportsPage />} />
                        </Route>
                      </Route>

                      {/* 🔒 RUTAS COMPARTIDAS (admin, super admin y empleado pueden acceder) */}
                      {/* ✅ IMPORTANTE: Estas rutas REQUIEREN restaurante asignado */}
                      <Route
                        element={<ProtectedRoutes allowedRoles={[1, 2, 3]} />}
                      >
                        <Route element={<RequireRestaurant />}>
                          <Route path="/menu" element={<MenuPage />} />
                          <Route path="/orders" element={<OrdersPage />} />
                        </Route>
                      </Route>
                    </Route>

                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </ReportsProvider>
              </OrderProvider>
            </AdminProvider>
          </UserProvider>
        </RestaurantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;