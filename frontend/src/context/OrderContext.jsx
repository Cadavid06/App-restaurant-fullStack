import { createContext, useContext, useEffect, useState } from "react";
import {
  createOrderRequest,
  getOrderRequest,
  getOrdersRequest,
  updateOrdersRequest,
  deleteOrdersRequest,
} from "../api/orders";
import { createInvoicesRequest, getInvoiceRequest } from "../api/invoices";

const OrderContext = createContext();

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrderContext must be used within an OrderProvider");
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [order, setOrder] = useState([]);
  const [invoice, setInvoice] = useState([]);
  const [errors, setErrors] = useState("");

  useEffect(() => {
    if (errors !== "") {
      const timer = setTimeout(() => {
        setErrors("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [errors]);

  const createOrder = async (orderData) => {
    try {
      const res = await createOrderRequest(orderData);
      setOrder((prev) => [...prev, res.data]);
      return res.data;
    } catch (error) {
      console.error("[v0] Error creating order:", error);
      setErrors(error.response?.data || ["Unexpected error"]);
      throw error;
    }
  };

  const getOrders = async () => {
    try {
      const res = await getOrdersRequest();
      // ✅ Asegura que siempre se guarde un array
      if (Array.isArray(res.data)) {
        setOrder(res.data);
      } else {
        console.warn("[v0] getOrders: respuesta no es array", res.data);
        setOrder([]);
      }
      return res.data;
    } catch (error) {
      console.error("[v0] Error fetching orders:", error);
      setErrors(error.response?.data || ["Unexpected error"]);
      setOrder([]); // ✅ evita que quede null
      throw error;
    }
  };

  const getOrder = async (id) => {
    try {
      const res = await getOrderRequest(id);
      return res.data;
    } catch (error) {
      console.error("[v0] Error fetching order:", error);
      setErrors(error.response?.data || ["Unexpected error"]);
      throw error;
    }
  };

  const updateOrders = async (id, data) => {
    try {
      const res = await updateOrdersRequest(id, data);
      await getOrders();
      return res.data;
    } catch (error) {
      console.error("[v0] Error updating order:", error);
      setErrors(error.response?.data || ["Unexpected error"]);
      throw error;
    }
  };

  const deleteOrders = async (id) => {
    try {
      const res = await deleteOrdersRequest(id);

      // ✅ Después de eliminar, actualizamos el estado local de forma segura
      setOrder((prev) =>
        Array.isArray(prev) ? prev.filter((o) => o.order_id !== id) : []
      );

      // ✅ Si el backend dice que tenía factura, mostramos alerta
      if (res.data?.hasInvoice) {
        alert(
          res.data.message ||
            "El pedido tenía una factura, la factura se conserva."
        );
      }

      return res.data;
    } catch (error) {
      console.error("[v0] Error deleting order:", error);
      setErrors(error.response?.data || ["Unexpected error"]);
      throw error;
    }
  };

  const createInvoice = async (idOrder, data) => {
    try {
      const res = await createInvoicesRequest(idOrder, data);
      setInvoice((prev) => [...prev, res.data.invoice]);

      // ✅ Actualiza has_invoice y status en el estado local
      setOrder((prev) =>
        prev.map((o) =>
          o.order_id === idOrder
            ? { ...o, has_invoice: true, status: "Completado" }
            : o
        )
      );

      return res.data;
    } catch (error) {
      console.error("[v0] Error creating invoice:", error);
      setErrors(error.response?.data || ["Unexpected error"]);
      throw error;
    }
  };

  const getInvoice = async (idOrder) => {
    try {
      const res = await getInvoiceRequest(idOrder);
      return res.data.orders?.[0] || null;
    } catch (error) {
      // Si la factura no existe, devolvemos null, no lanzamos excepción
      if (error.response?.status === 404) {
        return null;
      }
      console.error("[v0] Error fetching invoice:", error);
      setErrors(error.response?.data || ["Unexpected error"]);
      throw error;
    }
  };

  return (
    <OrderContext.Provider
      value={{
        order,
        createOrder,
        getOrders,
        getOrder,
        updateOrders,
        deleteOrders,
        createInvoice,
        getInvoice,
        errors,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
