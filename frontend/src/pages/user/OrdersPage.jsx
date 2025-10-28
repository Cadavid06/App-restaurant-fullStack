"use client";

import { useState, useEffect } from "react";
import { useOrderContext } from "../../context/OrderContext";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/layouts/Tabs";
import { OrdersTable } from "../../components/orders/OrdersTable";
import { OrderModal } from "../../components/orders/OrderModal";

function OrdersPage() {
  const { order, getOrders, updateOrders, deleteOrders } = useOrderContext();

  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    getOrders();
  }, []);

  const handleSave = async (data) => {
    console.log("[v0] Saving order:", data);
    if (data.id) {
      await updateOrders(data.id, {
        tableNumber: data.tableNumber,
        status: data.status,
        products: data.products,
      });
    }
    setOpen(false);
    setSelectedOrder(null);
  };

  const handleEdit = (orderToEdit) => {
    console.log("[v0] Editing order:", orderToEdit);
    setSelectedOrder(orderToEdit);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("¿Seguro que deseas eliminar este pedido?")) {
      await deleteOrders(id);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4 w-full sm:max-w-4/5 lg:max-w-3/4 mx-auto h-auto ">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h1>
        <p className="text-gray-500 text-sm mt-1">
          Administra todos los pedidos del restaurante
        </p>
      </div>

      <Tabs defaultValue="pendientes">
        <TabsList>
          <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
          <TabsTrigger value="completados">Completados</TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes">
          <div className="space-y-4 mt-4">
            <h2 className="text-xl font-semibold">Pedidos Pendientes</h2>
            <OrdersTable
              orders={order.filter((o) => {
                const derivedStatus = o.has_invoice
                  ? "Completado"
                  : "Pendiente";
                return derivedStatus.toLowerCase() !== "completado";
              })}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </TabsContent>
        <TabsContent value="completados">
          <div className="space-y-4 mt-4">
            <h2 className="text-xl font-semibold">Pedidos Completados</h2>
            <OrdersTable
              orders={order.filter((o) => {
                const derivedStatus = o.has_invoice
                  ? "Completado"
                  : "Pendiente";
                return derivedStatus.toLowerCase() === "completado";
              })}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </TabsContent>
      </Tabs>

      <OrderModal
        open={open}
        onClose={() => {
          setOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onSave={handleSave}
      />
    </div>
  );
}

export default OrdersPage;
