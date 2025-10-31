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
import { useForm, Controller } from "react-hook-form";
import { useAdminContext } from "../../context/AdminContext";

export function CategoryFormDialog({ open, onOpenChange, category, onSave }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
    },
  });

  const { errors: categoryErrors } = useAdminContext();

  useEffect(() => {
    if (category) {
      reset({
        name: category.name || "",
      });
    } else {
      reset({
        name: "",
      });
    }
  }, [category, open, reset]);

  const onSubmit = (data) => {
    const payload = {
      ...(category && { id: category.category_id }),
      name: data.name.trim(),
    };

    onSave(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar Categoría" : "Nueva Categoría"}
          </DialogTitle>
          <DialogDescription>
            {category
              ? "Modifica la información de la categoría."
              : "Completa los datos de la nueva categoría."}
          </DialogDescription>
        </DialogHeader>

        {Array.isArray(categoryErrors) && categoryErrors.length > 0 && (
          <div className="space-y-2 mb-4">
            {categoryErrors.map((error, i) => (
              <div
                key={i}
                className="bg-red-500 text-white text-sm p-2 rounded-md text-center"
              >
                {error}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Controller
                name="name"
                control={control}
                rules={{
                  required: "El nombre es obligatorio",
                  minLength: {
                    value: 2,
                    message: "El nombre debe tener al menos 2 caracteres",
                  },
                  maxLength: {
                    value: 50,
                    message: "El nombre no puede exceder 50 caracteres",
                  },
                }}
                render={({ field }) => (
                  <Input
                    id="name"
                    placeholder="Nombre de la categoría"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)} // necesario para algunos Inputs de ShadCN
                  />
                )}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
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
            <Button type="submit">
              {category ? "Guardar Cambios" : "Crear Categoría"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
