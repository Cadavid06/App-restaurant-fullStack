import axios from "./axios";

export const createOrderRequest = (order) => axios.post("/order", order);

export const getOrdersRequest = () => axios.get(`/order`);

export const getOrderRequest = (id) => axios.get(`/order/${id}`);

export const updateOrdersRequest = (id, order) =>
  axios.put(`/order/${id}`, order);

export const deleteOrdersRequest = (id) => axios.delete(`/order/${id}`);
