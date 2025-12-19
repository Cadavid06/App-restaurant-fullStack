import axios from "./axios";

// Obtener todos los restaurantes (solo Developer)
export const getRestaurantsRequest = () => axios.get("/restaurants");

// Obtener un restaurante específico
export const getRestaurantRequest = (id) => axios.get(`/restaurants/${id}`);

// Crear un nuevo restaurante
export const createRestaurantRequest = (restaurant) =>
  axios.post("/restaurants", restaurant);

// Actualizar un restaurante
export const updateRestaurantRequest = (id, restaurant) =>
  axios.put(`/restaurants/${id}`, restaurant);

// Eliminar un restaurante
export const deleteRestaurantRequest = (id) =>
  axios.delete(`/restaurants/${id}`);

// Obtener estadísticas de un restaurante
export const getRestaurantStatsRequest = (id) =>
  axios.get(`/restaurants/${id}/stats`);

// Desactivar un restaurante (soft delete)
export const deactivateRestaurantRequest = (id) =>
  axios.patch(`/restaurants/${id}/deactivate`);
