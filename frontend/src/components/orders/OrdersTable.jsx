import { Button } from "../ui/button";
import {
  Edit,
  SaveIcon,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import InvoiceModal from "../invoice/InvoiceModal";
import { useOrderContext } from "../../context/OrderContext";
import { useState, useMemo } from "react";

export function OrdersTable({ orders, onEdit, onDelete }) {
  const { getInvoice, getOrder } = useOrderContext();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- LÓGICA DE ORDENAMIENTO Y PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // 1. ✅ NUEVO: Ordenar los pedidos por fecha (del más reciente al más antiguo)
  // Usamos useMemo para evitar recalcular en cada render
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const dateA = new Date(a.date_time); // Asegúrate que 'date_time' sea el nombre correcto en tu BD
      const dateB = new Date(b.date_time);
      return dateB - dateA; // B - A = Orden Descendente (Nuevos primero)
    });
  }, [orders]);

  // 2. ✅ MODIFICADO: Usamos 'sortedOrders' en lugar de 'orders' para calcular páginas
  const totalPages = Math.ceil(sortedOrders.length / ITEMS_PER_PAGE);

  // 3. ✅ MODIFICADO: Cortamos el array YA ORDENADO
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentOrders = sortedOrders.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Funciones para cambiar de página
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  // -----------------------------

  const getInvoiceById = async (order_id) => {
    try {
      const data = await getInvoice(order_id);
      if (!data) {
        const orderDetails = await getOrder(order_id);
        const products =
          orderDetails.products?.map((p) => ({
            name: p.name || p.product_name,
            amount: p.amount || p.quantity || 1,
            price: Number(p.price || p.unit_price || 0),
            subtotal:
              (p.amount || p.quantity || 1) *
              Number(p.price || p.unit_price || 0),
          })) || [];
        const total_payment = products.reduce((acc, p) => acc + p.subtotal, 0);
        setSelectedInvoice({
          order_id,
          employee_id: orderDetails.employee_id || "N/A",
          products,
          total_payment,
          payment_method: "",
          date_time: orderDetails.date_time || new Date().toISOString(),
          isPreview: true,
        });
      } else {
        setSelectedInvoice({ ...data, isPreview: false });
      }
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching invoice or order:", error);
    }
  };

  // Componente reutilizable para los controles de paginación
  const PaginationControls = () => {
    if (totalPages <= 1) return null; // No mostrar si hay solo 1 página

    return (
      <div className="flex justify-center items-center gap-4 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        <span className="text-sm font-medium text-gray-600">
          Página {currentPage} de {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="mt-4">
      {/* 📱 VISTA CARD en pantallas pequeñas */}
      <div className="grid grid-cols-1 sm:hidden gap-4">
        {orders.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-4">
            No hay pedidos registrados
          </p>
        ) : (
          // Usamos 'currentOrders' en lugar de 'orders'
          currentOrders.map((order, index) => {
            const derivedStatus = order.has_invoice
              ? "Completado"
              : "Pendiente";
            return (
              <div
                key={order.order_id || index}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col space-y-2"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">
                    Pedido #{order.order_id}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      derivedStatus === "Completado"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {derivedStatus}
                  </span>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Empleado:</strong> {order.employee_id}
                  </p>
                  <p>
                    <strong>Fecha:</strong>{" "}
                    {order.date_time
                      ? new Date(order.date_time).toLocaleString("es-CO")
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Mesa:</strong> {order.table_number}
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(order)}
                    disabled={order.has_invoice}
                    title={
                      order.has_invoice
                        ? "No se puede editar: ya se generó una factura"
                        : "Editar pedido"
                    }
                  >
                    <Edit
                      className={`h-4 w-4 ${
                        order.has_invoice ? "text-gray-400" : "text-gray-700"
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(order.order_id)}
                    title="Eliminar pedido"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => getInvoiceById(order.order_id)}
                    title="Ver o generar factura"
                  >
                    <SaveIcon className="h-4 w-4 text-gray-700" />
                  </Button>
                </div>
              </div>
            );
          })
        )}

        {/* Controles de paginación para móvil */}
        <div className="sm:hidden">
          <PaginationControls />
        </div>
      </div>

      {/* 💻 VISTA TABLA en pantallas medianas/grandes */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
          <table className="w-full border-collapse min-w-[300px]">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold">
                  # Mesa
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-6 text-gray-500 text-sm"
                  >
                    No hay pedidos registrados
                  </td>
                </tr>
              ) : (
                // Usamos 'currentOrders' aquí también para mantener consistencia
                currentOrders.map((order, index) => {
                  const derivedStatus = order.has_invoice
                    ? "Completado"
                    : "Pendiente";
                  return (
                    <tr
                      key={order.order_id || index}
                      className="border-t hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-800 font-medium">
                        {order.order_id}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {order.employee_id}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {order.date_time
                          ? new Date(order.date_time).toLocaleString("es-CO")
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-right">
                        {order.table_number}
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            derivedStatus === "Completado"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {derivedStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(order)}
                            disabled={order.has_invoice}
                            title={
                              order.has_invoice
                                ? "No se puede editar: ya se generó una factura"
                                : "Editar pedido"
                            }
                          >
                            <Edit
                              className={`h-4 w-4 ${
                                order.has_invoice
                                  ? "text-gray-400"
                                  : "text-gray-700"
                              }`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(order.order_id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => getInvoiceById(order.order_id)}
                          >
                            <SaveIcon className="h-4 w-4 text-gray-700" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Controles de paginación para escritorio */}
        <PaginationControls />
      </div>

      {/* 🧾 MODAL DE FACTURA */}
      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
}
