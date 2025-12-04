// src/utils/sweetAlert.js
import Swal from "sweetalert2";

// 1. Alerta de Éxito (Para cuando creas o actualizas algo)
export const showSuccess = (title, message = "") => {
  return Swal.fire({
    title: title,
    text: message,
    icon: "success",
    confirmButtonColor: "#000000", // Negro (tu branding)
    confirmButtonText: "Aceptar",
    timer: 2000, // Se cierra sola en 2 segundos si no le dan click
    timerProgressBar: true,
  });
};

// 2. Alerta de Error (Para fallos del servidor o validaciones)
export const showError = (title, message) => {
  return Swal.fire({
    title: title,
    text: message,
    icon: "error",
    confirmButtonColor: "#000000",
    confirmButtonText: "Entendido",
  });
};

// 3. Alerta de Confirmación (Especial para ELIMINAR)
export const showDeleteConfirm = async (itemType = "elemento") => {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: `Esta acción eliminará el ${itemType} permanentemente.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33", // Rojo para peligro
    cancelButtonColor: "#000000", // Negro para cancelar
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    reverseButtons: true, // Pone el cancelar primero (mejor UX)
  });

  return result.isConfirmed; // Retorna true o false
};

// 4. Toast (Notificación pequeña en la esquina, ideal para "Agregado al carrito")
export const showToast = (title, icon = "success") => {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });
  Toast.fire({
    icon: icon,
    title: title
  });
};