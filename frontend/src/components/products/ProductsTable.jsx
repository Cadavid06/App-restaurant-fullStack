import { Button } from "../ui/button";
import { Edit, Trash2 } from "lucide-react";

export function ProductsTable({ products, onEdit, onDelete }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mt-4">
      <div className="overflow-x-auto">
        {/* ✅ Scroll horizontal */}
        <table className=" border-collapse min-w-[100px] ">
          {/* ✅ Min width para scroll */}
          <thead className="bg-gray-100">
            <tr>
              <th className="text-center px-4 md:px-6 py-3 text-sm font-semibold text-gray-700">
                {/* ✅ Padding adaptativo */}
                Nombre
              </th>
              <th className="text-center px-4 md:px-6 py-3 text-sm font-semibold text-gray-700 hidden md:table-cell">
                {/* ✅ Oculta en móviles */}
                Descripción
              </th>
              <th className="text-center px-4 md:px-6 py-3 text-sm font-semibold text-gray-700 hidden sm:table-cell">
                {/* ✅ Oculta en móviles pequeños */}
                Categoría
              </th>
              <th className="text-center px-4 md:px-6 py-3 text-sm font-semibold text-gray-700">
                Precio
              </th>
              <th className="text-center px-4 md:px-6 py-3 text-sm font-semibold text-gray-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-6 text-gray-500 text-sm"
                >
                  No hay productos registrados
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr
                  key={product.product_id || index}
                  className="border-t hover:bg-gray-50 transition-all"
                >
                  <td className="px-4 md:px-6 py-4 text-gray-800 font-medium text-sm md:text-base">
                    {/* ✅ Tamaño adaptativo */}
                    {product.name}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-gray-700 hidden md:table-cell text-sm md:text-base">
                    {/* ✅ Oculta en móviles */}
                    {product.description}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-gray-700 hidden sm:table-cell text-sm md:text-base">
                    {/* ✅ Oculta en móviles pequeños */}
                    {product.category_name || "Sin categoría"}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-gray-700 text-right text-sm md:text-base">
                    {/* ✅ Tamaño adaptativo */}${product.price}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 md:gap-2">
                      {/* ✅ Gap adaptativo */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(product.product_id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
