import { Button } from "../ui/button";
import { Edit, Trash2 } from "lucide-react";

export function SizeTable({ sizes, onEdit, onDelete }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mt-4">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
              Nombre
            </th>
            <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {sizes.length === 0 ? (
            <tr>
              <td
                colSpan={2}
                className="text-center py-6 text-gray-500 text-sm"
              >
                No hay tamaños registradas
              </td>
            </tr>
          ) : (
            sizes.map((size, index) => (
              <tr
                key={`${size.product_id}-${size.name}-${index}`}
                className="border-t hover:bg-gray-50 transition-all"
              >
                <td className="px-6 py-4 text-gray-800 font-medium">
                  {size.name}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(size)}
                    >
                      <Edit className="h-4 w-4 text-gray-700" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(size.sizes_id)}
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
  );
}
