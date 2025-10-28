import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectItem } from "../ui/select";
import { useAdminContext } from "../../context/AdminContext";
import { useForm, Controller } from "react-hook-form";

export function ProductFormDialog({ open, onOpenChange, product, categories, onSave }) {
  const { errors: categoriesErrors } = useAdminContext();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: "",
    },
  });

  useEffect(() => {
    if (product) {
      const catName =
        categories.find((c) => c.category_id === product.category_id)?.name || "";
      reset({
        name: product.name || "",
        description: product.description || "",
        category: catName,
        price: product.price != null ? String(product.price) : "",
      });
    } else {
      reset({
        name: "",
        description: "",
        category: "",
        price: "",
      });
    }
  }, [product, open, categories, reset]);

  const onSubmit = (data) => {
    const payload = {
      ...(product && { id: product.product_id }),
      name: data.name.trim(),
      description: data.description.trim(),
      // If you need to send category_id instead of name, map here:
      // category_id: categories.find(c => c.name === data.category)?.category_id || null
      category: data.category,
      price: Number(data.price),
    };

    console.log("Payload to send:", payload);
    onSave(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          <DialogDescription>
            {product ? "Modifica la información del producto." : "Completa los datos del nuevo producto."}
          </DialogDescription>
        </DialogHeader>

        {Array.isArray(categoriesErrors) && categoriesErrors.length > 0 && (
          <div className="space-y-2 mb-4">
            {categoriesErrors.map((err, i) => (
              <div key={i} className="bg-red-500 text-white text-sm p-2 rounded-md text-center">
                {err}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            {/* Nombre */}
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Controller
                name="name"
                control={control}
                rules={{
                  required: "El nombre es obligatorio",
                  minLength: { value: 2, message: "El nombre debe tener al menos 2 caracteres" },
                }}
                render={({ field }) => (
                  <Input id="name" {...field} />
                )}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            {/* Descripción */}
            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Controller
                name="description"
                control={control}
                rules={{
                  required: "La descripción es obligatoria",
                  minLength: { value: 5, message: "La descripción debe tener al menos 5 caracteres" },
                }}
                render={({ field }) => (
                  <Input id="description" {...field} />
                )}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>

            {/* Categoría */}
            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Controller
                name="category"
                control={control}
                rules={{ required: "La categoría es obligatoria" }}
                render={({ field }) => {
                  // Aquí intentamos soportar selects que usan onValueChange (shadcn) o onChange (simple)
                  const onValueChange = (v) => field.onChange(v);
                  const onChangeFallback = (e) => {
                    // si el select pasa un evento, extraemos value
                    const val = e?.target?.value ?? e;
                    field.onChange(val);
                  };

                  return (
                    <Select
                      value={field.value}
                      // si tu Select soporta onValueChange, usa esta línea:
                      onValueChange={onValueChange}
                      // fallback por si tu Select usa onChange:
                      onChange={onChangeFallback}
                      placeholder="Selecciona una categoría"
                    >
                      <SelectItem value="">-- Selecciona --</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.category_id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </Select>
                  );
                }}
              />
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
            </div>

            {/* Precio */}
            <div>
              <Label htmlFor="price">Precio *</Label>
              <Controller
                name="price"
                control={control}
                rules={{
                  required: "El precio es obligatorio",
                  validate: (v) => (Number(v) > 0) || "El precio debe ser mayor a 0",
                }}
                render={({ field }) => (
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{product ? "Guardar Cambios" : "Crear Producto"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
