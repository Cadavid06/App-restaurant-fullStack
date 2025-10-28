import { useState, useEffect } from "react";
import { useOrderContext } from "../../context/OrderContext";
import { Button } from "../ui/button";

function InvoiceModal({ isOpen, onClose, invoice }) {
  const { createInvoice } = useOrderContext();
  const [formData, setFormData] = useState({ payment_method: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (invoice) {
      setFormData({ payment_method: invoice.payment_method || "" });
    }
  }, [invoice]);

  if (!isOpen || !invoice) return null;

  const handleCreate = async () => {
    if (!formData.payment_method) {
      alert("Selecciona un método de pago.");
      return;
    }
    setLoading(true);
    try {
      await createInvoice(invoice.order_id, formData);
      alert("Factura generada correctamente ✅");
      onClose();
    } catch (error) {
      console.error("Error al generar factura:", error);
      alert("Error al generar la factura ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[600px] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {invoice.isPreview
            ? `Factura previa del pedido #${invoice.order_id}`
            : `Factura #${invoice.invoice_id}`}
        </h2>
        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Empleado:</strong> {invoice.employee_id}
          </p>
          <p>
            <strong>Fecha:</strong>{" "}
            {new Date(invoice.date_time).toLocaleString("es-CO")}
          </p>
        </div>
        {/* Sección de productos */}
        <div className="border-t border-gray-200 pt-3">
          <h3 className="font-semibold text-gray-700 mb-2">Productos</h3>
          {invoice.products && invoice.products.length > 0 ? (
            <div className="space-y-2">
              {invoice.products.map((p, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-gray-500">
                      Cant: {p.amount} x ${Number(p.price)?.toFixed(2)}
                    </p>{" "}
                    {/* Convierte a Number */}
                  </div>
                  <p className="font-semibold">
                    ${Number(p.subtotal)?.toFixed(2)}
                  </p>{" "}
                  {/* Convierte a Number */}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No hay productos en este pedido.
            </p>
          )}
        </div>
        <div className="border-t border-gray-200 pt-3">
          <p className="text-lg font-bold">
            <strong>Total a pagar:</strong> $
            {Number(invoice.total_payment)?.toFixed(2)}
          </p>{" "}
          {/* Convierte a Number */}
        </div>

        {invoice.isPreview ? (
          <>
            <div className="border-t border-gray-200 pt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de pago:
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={formData.payment_method}
                onChange={(e) =>
                  setFormData({ ...formData, payment_method: e.target.value })
                }
              >
                <option value="">Seleccionar...</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? "Guardando..." : "Generar factura"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="border-t border-gray-200 pt-3">
              <p>
                <strong>Método de pago:</strong> {invoice.payment_method}
              </p>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default InvoiceModal;
