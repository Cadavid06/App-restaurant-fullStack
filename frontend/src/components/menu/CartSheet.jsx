import { useState } from "react";
import { useForm } from "react-hook-form";
import { ClipboardList, Trash2, Minus, Plus, MenuSquareIcon } from "lucide-react";
import { useCart } from "./CartContext";
import { useOrderContext } from "../../context/OrderContext";

export default function CartSheet() {
  const { items, removeItem, clearCart, total, itemCount, updateQuantity } =
    useCart();
  const { createOrder, errors: orderErrors } = useOrderContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = async (data) => {
    const tableNumber = Number(data.numberTable);
    const products = items.map((item) => ({
      name: item.product.name,
      amount: item.quantity,
    }));

    await createOrder({
      tableNumber,
      products,
    });

    clearCart();
    reset();
    setIsOpen(false);
  };

  return (
    <>
      {/* BOTÓN FLOTANTE DEL CARRITO */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 flex items-center gap-2 bg-black text-white px-3 md:px-4 py-2 rounded-lg hover:bg-gray-800 transition shadow-lg text-sm md:text-base" // ✅ Posición adaptativa
      >
        <MenuSquareIcon className="w-5 h-5" />
        <span className="hidden md:inline">Carrito</span>{" "}
        {/* ✅ Oculta texto en móviles */}
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center font-bold">
            {itemCount}
          </span>
        )}
      </button>

      {/* PANEL DEL CARRITO */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
          <div className="bg-white w-full md:w-[400px] h-full flex flex-col shadow-xl animate-slide-left">
            {" "}
            {/* ✅ Ancho adaptativo */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg md:text-xl font-bold">Tu Pedido</h2>{" "}
              {/* ✅ Tamaño adaptativo */}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <ClipboardList className="w-12 md:w-16 h-12 md:h-16 mb-4 opacity-50" />{" "}
                  {/* ✅ Tamaño adaptativo */}
                  <p className="text-sm md:text-base">
                    No hay productos en el pedido
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product.product_id}
                    className="border rounded-lg p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2" // ✅ Stack en móviles
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-sm md:text-base">
                        {item.product.name}
                      </h3>{" "}
                      {/* ✅ Tamaño adaptativo */}
                      <p className="text-xs md:text-sm text-gray-500">
                        {" "}
                        {/* ✅ Tamaño adaptativo */}$
                        {Number(item.product.price).toFixed(2)} x{" "}
                        {item.quantity}
                      </p>
                      <p className="text-xs md:text-sm font-semibold mt-1">
                        Subtotal: $
                        {(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                      {" "}
                      {/* ✅ Justify adaptativo */}
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.product_id,
                            item.quantity - 1
                          )
                        }
                        className="p-1 rounded-md border hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-2 font-medium text-sm md:text-base">
                        {item.quantity}
                      </span>{" "}
                      {/* ✅ Tamaño adaptativo */}
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.product_id,
                            item.quantity + 1
                          )
                        }
                        className="p-1 rounded-md border hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.product.product_id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* FOOTER */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="border-t p-4 space-y-3"
            >
              {Array.isArray(orderErrors) && orderErrors.length > 0 && (
                <div className="space-y-2 mb-4">
                  {orderErrors.map((err, i) => (
                    <div
                      key={i}
                      className="bg-red-500 text-white text-sm p-2 rounded-md text-center"
                    >
                      {err}
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de mesa:
                </label>
                <input
                  type="number"
                  placeholder="Ej: 5"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none text-sm md:text-base" // ✅ Tamaño adaptativo
                  {...register("numberTable", {
                    required: "El número de mesa es obligatorio",
                    min: { value: 1, message: "Debe ser al menos 1" },
                  })}
                />
                {errors.numberTable && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.numberTable.message}
                  </p>
                )}
              </div>

              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="flex flex-col md:flex-row gap-2">
                {" "}
                {/* ✅ Stack en móviles */}
                <button
                  type="button"
                  onClick={clearCart}
                  disabled={items.length === 0}
                  className="flex-1 border rounded-md py-2 hover:bg-gray-100 disabled:opacity-50 text-sm md:text-base"
                >
                  Vaciar
                </button>
                <button
                  type="submit"
                  disabled={items.length === 0}
                  className="flex-1 bg-black text-white rounded-md py-2 hover:bg-gray-700 disabled:opacity-50 text-sm md:text-base"
                >
                  Confirmar pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
