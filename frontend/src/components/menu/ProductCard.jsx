"use client";

import { useState, useEffect } from "react";
import { Plus, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog"; // Asegúrate de tener estos componentes de UI (shadcn)
import { Button } from "../ui/button";
import { showToast } from "../../utils/sweetAlert";

export default function ProductCard({ product, variants = [], onAddToCart }) {
  // Inicializamos con el producto principal o la primera variante
  const [selectedVariant, setSelectedVariant] = useState(product);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setSelectedVariant(product);
  }, [product]);

  const handleVariantChange = (e) => {
    const variantId = Number(e.target.value);
    // Buscamos en las variantes el objeto completo basado en el ID seleccionado
    const variant = variants.find((v) => v.product_id === variantId) || product;
    setSelectedVariant(variant);
  };

  const handleAddClick = () => {
    onAddToCart(selectedVariant);
    setIsModalOpen(false);

    // Notificación elegante que no interrumpe
    showToast("Producto agregado al pedido", "success");
  };

  // Verificamos si realmente hay variantes distintas (más de 1 opción)
  const hasVariants = variants.length > 1;

  return (
    <>
      {/* TARJETA VISIBLE EN EL MENÚ */}
      <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-300 flex flex-col h-full relative group">
        {/* Botón flotante para ver detalles (aparece en hover o siempre visible en móvil) */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm text-gray-500 hover:text-black transition-colors z-10"
        >
          <Info className="w-5 h-5" />
        </button>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg text-gray-900 leading-tight">
            {product.name}
          </h3>

          {/* Descripción cortada (truncate) */}
          <p
            className="text-sm text-gray-500 mt-2 line-clamp-2 cursor-pointer hover:text-gray-700"
            onClick={() => setIsModalOpen(true)}
          >
            {selectedVariant.description || "Sin descripción disponible."}
          </p>

          <div className="mt-auto pt-4">
            <p className="text-xl font-bold text-gray-900">
              ${Number(selectedVariant.price).toFixed(2)}
            </p>

            {/* SELECTOR DE TAMAÑOS */}
            {hasVariants && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide"></label>
                <select
                  value={selectedVariant.product_id}
                  onChange={handleVariantChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all cursor-pointer"
                >
                  {variants.map((variant) => (
                    <option key={variant.product_id} value={variant.product_id}>
                      {/* Aquí usamos size_name que viene del backend */}
                      {variant.size_name || "Estándar"} - $
                      {Number(variant.price).toFixed(0)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={handleAddClick}
            className="w-full flex items-center justify-center gap-2 bg-black text-white font-medium py-2.5 rounded-xl hover:bg-gray-800 transition-colors duration-200 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar</span>
          </button>
        </div>
      </div>

      {/* MODAL DE DETALLES */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md w-[90%] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold">
              {product.name}
            </DialogTitle>
            {selectedVariant.size_name && (
              <DialogDescription className="text-black font-medium bg-gray-100 inline-block px-2 py-1 rounded text-xs">
                {selectedVariant.size_name}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm md:text-base leading-relaxed">
              {selectedVariant.description}
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-gray-500 text-sm">Precio unitario</span>
              <span className="text-2xl font-bold">
                ${Number(selectedVariant.price).toFixed(2)}
              </span>
            </div>
          </div>

          <DialogFooter className="flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              Cerrar
            </Button>
            <Button
              className="flex-1 bg-black text-white"
              onClick={handleAddClick}
            >
              Agregar al Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
