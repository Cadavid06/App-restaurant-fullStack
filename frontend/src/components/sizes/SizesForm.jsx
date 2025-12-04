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

export function SizeFormDialog({ open, onOpenChange, size, onSave }) {
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

  const { errors: sizeErrors} = useAdminContext();

  useEffect(() => {
    if (size) {
      reset({
        name: size.name || "",
      });
    } else {
      reset({
        name: "",
      });
    }
  }, [size, open, reset]);

  const onSubmit = (data) => {
    const payload = {
      ...(size && { id: size.size_id }),
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
            {size ? "Editar tamaño" : "Nueva tamaño"}
          </DialogTitle>
          <DialogDescription>
            {size
              ? "Modifica la información del tamaño."
              : "Completa los datos del nuevo tamaño."}
          </DialogDescription>
        </DialogHeader>

        {Array.isArray(sizeErrors) && sizeErrors.length > 0 && (
          <div className="space-y-2 mb-4">
            {sizeErrors.map((error, i) => (
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
                    placeholder="Nombre del tamaño"
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
              {size ? "Guardar Cambios" : "Crear tamaño"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
