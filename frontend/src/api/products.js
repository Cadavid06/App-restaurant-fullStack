import axios from './axios'

export const createProductsRequest = (product) => axios.post("/product", product);

export const getProductsRequest = () => axios.get("/product");

export const getProductRequest = (id) => axios.get(`/product/${id}`);

export const updateProductsRequest = (id, product) =>
  axios.put(`/product/${id}`, product);

export const deleteProductsRequest = (id) => axios.delete(`/product/${id}`);
