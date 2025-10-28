import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MenuPage from "./pages/user/MenuPage";
import OrdersPage from "./pages/user/OrdersPage";
import UsersPage from "./pages/admin/UsersPage";
import Dashboard from "./pages/admin/Dashboard";
import AdminPage from "./pages/admin/AdminPage";
import ReportsPage from "./pages/admin/ReportsPage";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import { AdminProvider } from "./context/AdminContext";
import { OrderProvider } from "./context/OrderContext";
import { ReportsProvider } from "./context/ReportsContext";
import ProtectedRoutes from "./ProtectedRoutes";
import NotFoundPage from "./pages/NotFoundPage";
import DashboardLayout from "./components/layouts/DashboardLayouts";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <AdminProvider>
            <OrderProvider>
              <ReportsProvider>
                <Routes>
                  {/* 🏠 RUTA PÚBLICA */}
                  <Route path="/" element={<LoginPage />} />
                  <Route element={<DashboardLayout />}>
                    {/* 🔒 RUTAS DEL ADMINISTRADOR (solo admin) */}
                    <Route element={<ProtectedRoutes allowedRoles={[1]} />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/users" element={<UsersPage />} />
                      <Route path="/products" element={<AdminPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                    </Route>

                    {/* 🔒 RUTAS COMPARTIDAS (admin y empleado pueden acceder) */}
                    <Route element={<ProtectedRoutes allowedRoles={[1, 2]} />}>
                      <Route path="/menu" element={<MenuPage />} />
                      <Route path="/orders" element={<OrdersPage />} />
                    </Route>
                  </Route>
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </ReportsProvider>
            </OrderProvider>
          </AdminProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
