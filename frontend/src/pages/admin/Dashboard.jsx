import { useEffect, useState } from "react";
import { useOrderContext } from "../../context/OrderContext";
import { useUser } from "../../context/UserContext";
import { useReports } from "../../context/ReportsContext";

function Dashboard() {
  const { order, getOrders } = useOrderContext();
  const { users, getUsers } = useUser();
  const { getReports } = useReports();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (loading) {
        try {
          await getOrders();
          await getUsers();

          const startDate = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
          )
            .toISOString()
            .split("T")[0];
          const endDate = new Date().toISOString().split("T")[0];
          const reports = await getReports(startDate, endDate);
          setSummary(reports);
        } catch (error) {
          console.error("Error loading dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, []);

  const totalOrders = loading ? 0 : order.length;
  const pendingOrders = loading
    ? 0
    : order.filter((o) => o.status === "Pendiente").length;
  const completedOrders = loading
    ? 0
    : order.filter((o) => o.status === "Completado").length;
  const totalUsers = loading ? 0 : users.length;

  if (loading) {
    return <div className="p-4 md:p-6">Cargando dashboard...</div>; // ✅ Padding adaptativo
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 space-y-4 md:space-y-6">
      {/* ✅ Padding adaptativo */}
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">
        {/* ✅ Tamaño adaptativo */}
        Dashboard Administrativo
      </h1>
      <p className="text-gray-500 text-sm md:text-base">
        Resumen general del restaurante
      </p>
      {/* ✅ Tamaño adaptativo */}
      {/* Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ✅ Grid adaptativo */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Total Pedidos</h3>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Pedidos Pendientes</h3>
          <p className="text-2xl font-bold">{pendingOrders}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Pedidos Completados</h3>
          <p className="text-2xl font-bold">{completedOrders}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Usuarios Registrados</h3>
          <p className="text-2xl font-bold">{totalUsers}</p>
        </div>
      </div>
      {/* Ingresos del Mes */}
      {summary && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Ingresos del Mes Actual</h2>
          <p>Facturas: {summary.totalRevenue.total_invoices}</p>
          <p className="text-2xl font-bold">
            ${Number(summary.totalRevenue.total_revenue)?.toFixed(2)}
          </p>
        </div>
      )}
      {/* Productos Más Vendidos (Top 3) */}
      {summary && summary.topProducts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">
            Productos Más Vendidos (Mes Actual)
          </h2>
          <div className="overflow-x-auto">
            {/* ✅ Scroll horizontal */}
            <table className=" border-collapse min-w-[100px] text-center">
              {/* ✅ Min width */}
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-sm md:text-base">Producto</th>
                  {/* ✅ Tamaño adaptativo */}
                  <th className="px-4 py-2 text-sm md:text-base">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {summary.topProducts.slice(0, 3).map((p, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 text-sm md:text-base">{p.name}</td>
                    {/* ✅ Tamaño adaptativo */}
                    <td className="px-4 py-2 text-sm md:text-base">
                      {Number(p.total_sold)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
