import { useEffect, useState } from "react";
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

  if (!category.length || !product.length) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground text-sm md:text-base">
          Cargando menú...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      {/* Header del menú */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Menú</h1>
          <p className="text-gray-500 text-sm md:text-base mt-1">
            Selecciona productos para crear un pedido
          </p>
        </div>

        {/* Carrito */}
        <div className="flex justify-center sm:justify-end">
          <CartSheet onCheckout={() => setCheckoutOpen(true)} />
        </div>
      </div>

      {/* Tabs de categorías */}
      <Tabs defaultValue={String(category[0]?.category_id)} className="w-full">
        <TabsList
          className="w-full flex gap-2 overflow-x-auto border-b border-gray-200 pb-2"
          style={{ scrollbarWidth: "none" }} // Firefox
        >
          {category.map((cat) => (
            <TabsTrigger
              key={cat.category_id}
              value={String(cat.category_id)}
              className="px-4 py-2 text-sm md:text-base font-medium whitespace-nowrap rounded-md transition-colors 
                         data-[state=active]:bg-gray-900 data-[state=active]:text-white
                         hover:bg-gray-100"
            >
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Productos por categoría */}
        {category.map((cat) => (
          <TabsContent
            key={cat.category_id}
            value={String(cat.category_id)}
            className="mt-6"
          >
            <div
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 
                         gap-3 sm:gap-4"
            >
              {product
                .filter((p) => p.category_id === cat.category_id)
                .map((p) => (
                  <ProductCard
                    key={p.product_id}
                    product={p}
                    onAddToCart={addItem}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Modal de checkout */}
      <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </div>
  );
}

export default function EmployeeMenuPage() {
  return (
    <CartProvider>
      <MenuContent />
    </CartProvider>
  );
}
