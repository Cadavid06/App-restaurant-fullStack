"use client";

import { Plus } from "lucide-react";

export default function ProductCard({ product, onAddToCart }) {
  const handleAddClick = () => {
    onAddToCart(product);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-300">
      {/* Contenido */}
      <div className="p-3 md:p-4">
        {" "}
        {/* ✅ Padding adaptativo */}
        <h3 className="font-semibold text-base md:text-lg text-gray-900">
          {product.name}
        </h3>{" "}
        {/* ✅ Tamaño adaptativo */}
        <p className="text-xs md:text-sm text-gray-500 mt-1 line-clamp-2">
          {" "}
          {/* ✅ Tamaño adaptativo */}
          {product.description || "Sin descripción"}
        </p>
        <p className="text-lg md:text-xl font-bold text-gray-900 mt-2">
          {" "}
          {/* ✅ Tamaño adaptativo */}$
          {Number.parseFloat(product.price).toFixed(2)}
        </p>
      </div>

      {/* Botón */}
      <div className="px-3 md:px-4 pb-3 md:pb-4">
        {" "}
        {/* ✅ Padding adaptativo */}
        <button
          onClick={handleAddClick}
          className="w-full flex items-center justify-center bg-black text-white font-medium py-2 rounded-lg duration-200 text-sm md:text-base p-4" // ✅ Tamaño adaptativo
        >Agregar
        </button>
      </div>
    </div>
  );
}
