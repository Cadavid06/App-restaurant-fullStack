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

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
  sizes,
  onSave,
}) {
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
      size: "", 
      price: "",
    },
  });

  useEffect(() => {
    if (product) {
      // Buscar el nombre de la categoría basado en el ID del producto (si tienes el ID) o usar el nombre directo
      // Como tu backend getProducts devuelve category_name y size_name, podemos usarlos.

      // Intentamos machear nombre de categoría
      const catName =
        categories.find((c) => c.category_id === product.category_id)?.name ||
        product.category_name ||
        "";

      // 3. Lógica para pre-seleccionar el tamaño
      // Si 'product' viene de la tabla, tiene product.size_name.
      // Si viene de una edición cruda, podría tener size_id.
      let sizeVal = "";
      if (product.size_name) {
        sizeVal = product.size_name;
      } else if (product.size_id) {
        sizeVal = sizes?.find((s) => s.size_id === product.size_id)?.name || "";
      }

      reset({
        name: product.name || "",
        description: product.description || "",
        category: catName,
        size: sizeVal, 
        price: product.price != null ? String(product.price) : "",
      });
    } else {
      reset({
        name: "",
        description: "",
        category: "",
        size: "",
        price: "",
      });
    }
  }, [product, open, categories, sizes, reset]);

  const onSubmit = (data) => {
    const payload = {
      ...(product && { id: product.product_id }),
      name: data.name.trim(),
      description: data.description.trim(),
      category: data.category,
      size: data.size, 
      price: Number(data.price),
    };

    onSave(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {product ? "Editar Producto" : "Nuevo Producto"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Modifica la información del producto."
              : "Completa los datos del nuevo producto."}
          </DialogDescription>
        </DialogHeader>

        {/* Manejo de errores globales */}
        {Array.isArray(categoriesErrors) && categoriesErrors.length > 0 && (
          <div className="space-y-2 mb-4">
            {categoriesErrors.map((err, i) => (
              <div
                key={i}
                className="bg-red-500 text-white text-sm p-2 rounded-md text-center"
              >
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
                  minLength: { value: 2, message: "Mínimo 2 caracteres" },
                }}
                render={({ field }) => <Input id="name" {...field} />}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Controller
                name="description"
                control={control}
                rules={{
                  required: "La descripción es obligatoria",
                }}
                render={({ field }) => <Input id="description" {...field} />}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Categoría */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoría *</Label>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Requerido" }}
                  render={({ field }) => {
                    const onValueChange = (v) => field.onChange(v);
                    const onChangeFallback = (e) => {
                      const val = e?.target?.value ?? e;
                      field.onChange(val);
                    };
                    return (
                      <Select
                        value={field.value}
                        onValueChange={onValueChange}
                        onChange={onChangeFallback}
                      >
                        <SelectItem value="">-- Selec --</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.category_id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </Select>
                    );
                  }}
                />
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* 5. NUEVO CAMPO: TAMAÑO */}
              <div>
                <Label htmlFor="size">Tamaño</Label>
                <Controller
                  name="size"
                  control={control}
                  // No es required porque dijiste que es opcional
                  render={({ field }) => {
                    const onValueChange = (v) => field.onChange(v);
                    const onChangeFallback = (e) => {
                      const val = e?.target?.value ?? e;
                      field.onChange(val);
                    };
                    return (
                      <Select
                        value={field.value}
                        onValueChange={onValueChange}
                        onChange={onChangeFallback}
                      >
                        <SelectItem value="">-- Ninguno --</SelectItem>
                        {sizes &&
                          sizes.map((s) => (
                            <SelectItem key={s.size_id} value={s.name}>
                              {s.name}
                            </SelectItem>
                          ))}
                      </Select>
                    );
                  }}
                />
              </div>
            </div>

            {/* Precio */}
            <div>
              <Label htmlFor="price">Precio *</Label>
              <Controller
                name="price"
                control={control}
                rules={{
                  required: "Requerido",
                  validate: (v) => Number(v) > 0 || "Mayor a 0",
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
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">{product ? "Guardar" : "Crear"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
