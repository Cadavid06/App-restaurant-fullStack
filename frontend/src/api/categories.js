import axios from './axios'

export const CreateCategoriesRequest = (category) =>
  axios.post("/category", category);

export const getCategoriesRequest = () => axios.get("/category");

export const getCategoryRequest = (id) => axios.get(`/category/${id}`);

export const updateCategoriesRequest = (id, category) =>
  axios.put(`/category/${id}`, category);

export const deleteCategoriesRequest = (id) => axios.delete(`/category/${id}`);
