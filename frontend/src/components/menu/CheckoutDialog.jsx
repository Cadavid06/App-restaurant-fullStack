"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useCart } from "./CartContext";

export function CheckoutDialog({ open, onOpenChange }) {
  const { items, total, clearCart } = useCart();

  const handleConfirm = () => {
    console.log("[v0] CheckoutDialog - Confirming order:", { items, total });
    alert("✅ Pedido confirmado con éxito");
    clearCart();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md mx-4 md:mx-auto">
        {" "}
        {/* ✅ Ancho máximo y padding lateral en móviles */}
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">
            Confirmar Pedido
          </DialogTitle>{" "}
          {/* ✅ Tamaño adaptativo */}
        </DialogHeader>
        <div className="space-y-3 max-h-64 md:max-h-96 overflow-y-auto">
          {" "}
          {/* ✅ Altura adaptativa */}
          {items.map((item) => (
            <div
              key={item.product.product_id}
              className="flex justify-between items-center text-sm border-b pb-2"
            >
              <div className="flex-1">
                <p className="font-medium">{item.product.name}</p>
                <p className="text-muted-foreground text-xs md:text-sm">
                  {" "}
                  {/* ✅ Tamaño adaptativo */}$
                  {Number.parseFloat(item.product.price).toFixed(2)} x{" "}
                  {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-sm md:text-base">
                ${(item.product.price * item.quantity).toFixed(2)}
              </p>{" "}
              {/* ✅ Tamaño adaptativo */}
            </div>
          ))}
          <div className="flex justify-between items-center font-bold text-lg pt-2 border-t">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0 flex-col md:flex-row">
          {" "}
          {/* ✅ Stack en móviles */}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full md:w-auto"
          >
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="w-full md:w-auto">
            Confirmar Pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
