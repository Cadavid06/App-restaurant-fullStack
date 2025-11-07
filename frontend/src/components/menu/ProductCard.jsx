"use client";

import { useState, useEffect } from "react"; // ✅ Agrega useState y useEffect
import { Plus } from "lucide-react";

export default function ProductCard({ product, variants = [], onAddToCart }) {
  // ✅ Agrega variants como prop
  const [selectedVariant, setSelectedVariant] = useState(product); // ✅ Estado para variante seleccionada

  useEffect(() => {
    setSelectedVariant(product); // ✅ Resetea cuando cambia el producto
  }, [product]);

  const handleVariantChange = (e) => {
    const variantId = e.target.value;
    const variant =
      variants.find((v) => v.product_id === parseInt(variantId)) || product;
    setSelectedVariant(variant);
  };

  const handleAddClick = () => {
    onAddToCart(selectedVariant); // ✅ Agrega la variante seleccionada
  };

  const hasVariants = variants.length > 1; // ✅ Si hay más de 1 variante

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-300">
      <div className="p-3 md:p-4">
        <h3 className="font-semibold text-base md:text-lg text-gray-900">
          {product.name}
        </h3>
        <p className="text-xs md:text-sm text-gray-500 mt-1 line-clamp-2">
          {selectedVariant.description || "Sin descripción"}{" "}
          {/* ✅ Muestra descripción de variante */}
        </p>
        <p className="text-lg md:text-xl font-bold text-gray-900 mt-2">
          ${Number.parseFloat(selectedVariant.price).toFixed(2)}{" "}
          {/* ✅ Precio de variante */}
        </p>

        {/* ✅ Select para variantes si hay más de 1 */}
        {hasVariants && (
          <div className="mt-2">
            <label className="block text-xs md:text-sm font-medium text-gray-700">
              Tamaño:
            </label>
            <select
              value={selectedVariant.product_id}
              onChange={handleVariantChange}
              className="w-full px-2 py-1 border rounded-md text-xs md:text-sm"
            >
              {variants.map((variant) => (
                <option key={variant.product_id} value={variant.product_id}>
                  {variant.description.split(" - ")[1] || variant.description}{" "}
                  {/* ✅ Muestra solo el tamaño */}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="px-3 md:px-4 pb-3 md:pb-4">
        <button
          onClick={handleAddClick}
          className="w-full flex items-center justify-center bg-black text-white font-medium py-2 rounded-lg duration-200 text-sm md:text-base p-4"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}
