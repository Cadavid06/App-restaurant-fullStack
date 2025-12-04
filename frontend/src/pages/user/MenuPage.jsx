import { useEffect, useState, useMemo } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/layouts/Tabs";
import ProductCard from "../../components/menu/ProductCard"; 
import CartSheet from "../../components/menu/CartSheet";
import { CheckoutDialog } from "../../components/menu/CheckoutDialog";
import { CartProvider, useCart } from "../../components/menu/CartContext";
import { useAdminContext } from "../../context/AdminContext";

function MenuContent() {
  const { addItem } = useCart();
  const { category, product, getCategories, getProducts } = useAdminContext();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    getCategories();
    getProducts();
  }, []);

  // ✅ LOGICA DE AGRUPACIÓN MEJORADA (Con useMemo para rendimiento)
  const groupedProducts = useMemo(() => {
    if (!product) return {};

    const groups = {};

    product.forEach((prod) => {
      // Normalizamos el nombre (minusculas y sin espacios extra) para evitar duplicados
      const nameKey = prod.name.trim().toLowerCase();

      if (!groups[nameKey]) {
        groups[nameKey] = [];
      }
      groups[nameKey].push(prod);
    });

    // Ordenamos las variantes dentro de cada grupo por precio (menor a mayor)
    // Para que el select empiece con el tamaño más barato o el orden lógico
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => Number(a.price) - Number(b.price));
    });

    return groups;
  }, [product]);

  // Loading state simple
  if (!category.length || !product.length) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-bounce"></div>
          <p className="text-muted-foreground text-sm">Cargando menú...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 pb-24">
      {/* pb-24 añadido para que el botón flotante del carrito no tape el contenido final */}

      {/* Header del menú */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Menú
          </h1>
          <p className="text-gray-500 text-sm md:text-base mt-1">
            Selecciona productos y pedidos
          </p>
        </div>

        {/* El componente del Carrito */}
        <div className="flex justify-center sm:justify-end">
          <CartSheet onCheckout={() => setCheckoutOpen(true)} />
        </div>
      </div>

      {/* Tabs de categorías */}
      <Tabs defaultValue={String(category[0]?.category_id)} className="w-full">
        <TabsList
          className="w-full flex gap-2 overflow-x-auto border-b border-gray-200 pb-2 mb-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {category.map((cat) => (
            <TabsTrigger
              key={cat.category_id}
              value={String(cat.category_id)}
              className="px-5 py-2 text-sm md:text-base font-medium whitespace-nowrap rounded-full border transition-all 
                         data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-black
                         hover:bg-gray-50 border-gray-200"
            >
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Renderizado de Productos por Categoría */}
        {category.map((cat) => (
          <TabsContent
            key={cat.category_id}
            value={String(cat.category_id)}
            className="animate-in fade-in zoom-in-95 duration-300"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Object.keys(groupedProducts)
                .filter((nameKey) => {
                  const variants = groupedProducts[nameKey];
                  // Mostramos el grupo si SU PRIMERA variante pertenece a esta categoría
                  // (Asumimos que todas las tallas de una pizza son de la misma categoría)
                  return variants[0].category_id === cat.category_id;
                })
                .map((nameKey) => {
                  const variants = groupedProducts[nameKey];
                  const mainProduct = variants[0]; // Usamos la primera variante (la más barata) como base

                  return (
                    <ProductCard
                      key={mainProduct.product_id} // Key única
                      product={mainProduct} // Datos base (nombre, desc)
                      variants={variants} // Array con todos los tamaños
                      onAddToCart={addItem} // Función del carrito
                    />
                  );
                })}
            </div>

            {/* Mensaje si no hay productos en la categoría */}
            {Object.keys(groupedProducts).filter(
              (key) => groupedProducts[key][0].category_id === cat.category_id
            ).length === 0 && (
              <div className="text-center py-10 text-gray-400">
                No hay productos en esta categoría.
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Modal de confirmación final */}
      <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </div>
  );
}

// Wrapper para proveer el contexto del carrito a la página
export default function EmployeeMenuPage() {
  return (
    <CartProvider>
      <MenuContent />
    </CartProvider>
  );
}
