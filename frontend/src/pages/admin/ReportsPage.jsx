import { useState } from "react";
import { useForm } from "react-hook-form";
import { useReports } from "../../context/ReportsContext";
import { Button } from "../../components/ui/button";

function ReportsPage() {
  const { reports, getReports, errors } = useReports();
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    try {
      await getReports(data.startDate, data.endDate);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 space-y-4 md:space-y-6">
      {/* ✅ Padding adaptativo */}
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">
        {/* ✅ Tamaño adaptativo */}
        Reportes de Contabilidad
      </h1>
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
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ✅ Grid adaptativo */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha Inicio
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border rounded-md text-sm md:text-base" // ✅ Tamaño adaptativo
              {...register("startDate", {
                required: "Fecha inicio obligatoria",
              })}
            />
            {formErrors.startDate && (
              <p className="text-red-500 text-sm">
                {formErrors.startDate.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha Fin
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border rounded-md text-sm md:text-base" // ✅ Tamaño adaptativo
              {...register("endDate", { required: "Fecha fin obligatoria" })}
            />
            {formErrors.endDate && (
              <p className="text-red-500 text-sm">
                {formErrors.endDate.message}
              </p>
            )}
          </div>
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="text-sm md:text-base"
        >
          {/* ✅ Tamaño adaptativo */}
          {loading ? "Generando..." : "Generar Reporte"}
        </Button>
      </form>
      {reports && (
        <div className="space-y-4 md:space-y-6">
          {/* ✅ Espaciado adaptativo */}
          {/* Ingresos Totales */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold">Ingresos Totales</h2>
            <p>Facturas: {reports.totalRevenue.total_invoices}</p>
            <p>
              Total: ${Number(reports.totalRevenue.total_revenue)?.toFixed(2)}
            </p>
          </div>
          {/* Productos Más Vendidos */}
          <div>
            <h2 className="text-lg font-semibold">Productos Más Vendidos</h2>
            <div className="overflow-x-auto">
              {/* ✅ Scroll horizontal */}
              <table className="w-full border-collapse min-w-[200px] text-center">
                {/* ✅ Min width */}
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-sm md:text-base">Producto</th>
                    {/* ✅ Tamaño adaptativo */}
                    <th className="px-4 py-2 text-sm md:text-base">
                      Cantidad Vendida
                    </th>
                    <th className="px-4 py-2 text-sm md:text-base">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.topProducts.map((p, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2 text-sm md:text-base">
                        {p.name}
                      </td>
                      {/* ✅ Tamaño adaptativo */}
                      <td className="px-4 py-2 text-sm md:text-base">
                        {Number(p.total_sold)}
                      </td>
                      <td className="px-4 py-2 text-sm md:text-base">
                        ${Number(p.total_revenue)?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Ingresos por Empleado */}
          <div>
            <h2 className="text-lg font-semibold">Ingresos por Empleado</h2>
            <div className="overflow-x-auto">
              {/* ✅ Scroll horizontal */}
              <table className="w-full border-collapse min-w-[200px] text-center">
                {/* ✅ Min width */}
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-sm md:text-base">Empleado</th>
                    {/* ✅ Tamaño adaptativo */}
                    <th className="px-4 py-2 text-sm md:text-base">Facturas</th>
                    <th className="px-4 py-2 text-sm md:text-base">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.revenueByEmployee.map((e, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2 text-sm md:text-base">
                        {e.employee_name}
                      </td>
                      {/* ✅ Tamaño adaptativo */}
                      <td className="px-4 py-2 text-sm md:text-base">
                        {Number(e.invoices_handled)}
                      </td>
                      <td className="px-4 py-2 text-sm md:text-base">
                        ${Number(e.total_revenue)?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
