import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../layouts/Tabs";
import { useAdminContext } from "../../context/AdminContext";
import { useOrderContext } from "../../context/OrderContext";
import { Minus, Plus, Trash2, X } from "lucide-react";

export function OrderModal({ open, onClose, order, onSave }) {
  const { category, getCategories, product, getProducts } = useAdminContext();
  const { getOrder } = useOrderContext();

  const [formData, setFormData] = useState({
    tableNumber: "",
    products: [],
  });

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [showAddSection, setShowAddSection] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (open) {
        await getCategories();
        await getProducts();

        if (order) {
          try {
            const fullOrder = await getOrder(order.order_id);

            setFormData({
              tableNumber: fullOrder.table_number || order.table_number || "",
              products:
                fullOrder.products?.map((p) => ({
                  product_id: p.product_id,
                  name: p.name || p.product_name,
                  amount: p.amount || p.quantity || 1,
                  price: Number(p.price || p.unit_price || 0),
                })) || [],
            });
          } catch (error) {
            console.error("[v0] Error loading order details:", error);
            setFormData({
              tableNumber: order.table_number || "",
              products: [],
            });
          }
        } else {
          setFormData({
            tableNumber: "",
            products: [],
          });
        }
      }
    };
    loadData();
  }, [open, order]);

  useEffect(() => {
    if (!open) {
      setShowAddSection(false);
      setSelectedProduct("");
      setSelectedCategory("");
    }
  }, [open]);

  useEffect(() => {
    if (showAddSection && category.length > 0 && !selectedCategory) {
      const firstCategory = category[0].name || category[0].nombre;
      setSelectedCategory(firstCategory);
    }
  }, [showAddSection, category, selectedCategory]);

  if (!open) return null;

  const handleQuantity = (index, type, event) => {
    event.preventDefault();
    event.stopPropagation();

    setFormData((prev) => {
      const updated = [...prev.products];
      if (type === "plus") {
        updated[index].amount += 1;
      } else if (type === "minus" && updated[index].amount > 1) {
        updated[index].amount -= 1;
      }
      return { ...prev, products: updated };
    });
  };

  const handleRemove = (index, event) => {
    event.preventDefault();
    event.stopPropagation();

    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const filteredProducts = selectedCategory
    ? product.filter((p) => {
        const selectedCat = category.find(
          (cat) => (cat.name || cat.nombre) === selectedCategory
        );

        if (!selectedCat) {
          console.log("[v0] Selected category not found:", selectedCategory);
          return false;
        }

        const selectedCatId =
          selectedCat.category_id || selectedCat.categoria_id;
        const productCatId = p.category_id || p.categoria_id;

        return productCatId === selectedCatId;
      })
    : [];

  const handleAddProduct = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!selectedProduct) {
      alert("Por favor selecciona un producto");
      return;
    }

    const found = product.find(
      (p) =>
        p.product_id === Number.parseInt(selectedProduct) ||
        p.id === Number.parseInt(selectedProduct)
    );

    if (!found) {
      alert("Producto no encontrado");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        {
          product_id: found.product_id || found.id,
          name: found.name,
          amount: 1,
          price: Number(found.price || 0),
        },
      ],
    }));

    setSelectedProduct("");
    setShowAddSection(false);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setSelectedProduct("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tableNumber || formData.tableNumber <= 0) {
      alert("Por favor ingresa un número de mesa válido");
      return;
    }

    if (formData.products.length === 0) {
      alert("Debes agregar al menos un producto");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        tableNumber: Number(formData.tableNumber),
        products: formData.products.map((p) => ({
          name: String(p.name),
          amount: Number(p.amount),
        })),
      };

      await onSave({
        id: order?.order_id,
        ...payload,
      });

      onClose();
    } catch (error) {
      console.error("[v0] Error saving order:", error);
      alert(
        "Error al guardar el pedido: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const total = formData.products.reduce(
    (acc, p) => acc + (p.price || 0) * (p.amount || 0),
    0
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-2 sm:px-4">
      {/* 💡 Modal responsive */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md sm:max-w-2xl lg:max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto transition-all">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            {order ? `Editar Pedido #${order.order_id}` : "Nuevo Pedido"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} type="button">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mesa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Mesa *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.tableNumber}
                onChange={(e) =>
                  setFormData({ ...formData, tableNumber: e.target.value })
                }
                className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Número de mesa"
              />
            </div>
          </div>

          {/* Productos */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">
              Productos del Pedido
            </h3>
            {formData.products.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center border border-dashed rounded-lg">
                No hay productos. Haz clic en "Agregar Producto" para añadir.
              </p>
            ) : (
              <div className="space-y-2">
                {formData.products.map((p, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center border border-gray-200 p-3 rounded-lg hover:bg-gray-50 gap-2 sm:gap-4"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm sm:text-base">
                        {p.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        ${p.price?.toFixed(2)} c/u
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="flex items-center gap-2 border rounded-lg px-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleQuantity(index, "minus", e)}
                          disabled={p.amount <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-6 sm:w-8 text-center font-medium text-sm">
                          {p.amount}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleQuantity(index, "plus", e)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <span className="w-16 sm:w-20 text-right font-semibold text-sm sm:text-base">
                        ${(p.price * p.amount).toFixed(2)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleRemove(index, e)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botón agregar */}
          {!showAddSection && (
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => setShowAddSection(true)}
                variant="outline"
              >
                + Agregar Producto
              </Button>
            </div>
          )}

          {/* Sección Agregar */}
          {showAddSection && (
            <div className="border border-gray-300 p-3 sm:p-4 rounded-xl bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-2">
                <h4 className="font-semibold text-gray-700 text-sm sm:text-base">
                  Seleccionar Producto
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddSection(false)}
                >
                  Cancelar
                </Button>
              </div>

              <Tabs
                value={selectedCategory}
                onValueChange={handleCategoryChange}
              >
                <TabsList className="w-full justify-start overflow-x-auto text-sm sm:text-base">
                  {category.map((cat) => (
                    <TabsTrigger
                      key={cat.category_id || cat.categoria_id}
                      value={cat.name || cat.nombre}
                      type="button"
                    >
                      {cat.name || cat.nombre}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {category.map((cat) => (
                  <TabsContent
                    key={cat.category_id || cat.categoria_id}
                    value={cat.name || cat.nombre}
                  >
                    <div className="flex flex-col sm:flex-row gap-2 items-end mt-3">
                      <div className="flex-1 w-full">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Producto
                        </label>
                        <select
                          value={selectedProduct}
                          onChange={(e) => setSelectedProduct(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Seleccionar producto</option>
                          {filteredProducts.map((p) => (
                            <option
                              key={p.product_id || p.id}
                              value={p.product_id || p.id}
                            >
                              {p.name} - ${p.price}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button
                        type="button"
                        onClick={handleAddProduct}
                        disabled={!selectedProduct}
                        className="w-full sm:w-auto"
                      >
                        Añadir
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-base sm:text-lg font-bold">
              <span>Total:</span>
              <span className="text-xl sm:text-2xl text-black mt-1 sm:mt-0">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Guardando..." : "Guardar Pedido"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
