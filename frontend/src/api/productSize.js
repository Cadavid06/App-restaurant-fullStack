import axios from "./axios";

export const createSizeRequest = (size) => axios.post("/productSize", size);

export const getSizesRequest = () => axios.get("/productSize");

export const getSizeRequest = (id) => axios.get(`/productSize/${id}`);

export const updateSizeRequest = (id, size) =>
  axios.put(`/productSize/${id}`, size);

export const deleteSizeRequest = (id) => axios.delete(`/productSize/${id}`);
