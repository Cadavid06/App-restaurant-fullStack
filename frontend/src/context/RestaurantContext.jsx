import { createContext, useContext, useState, useEffect } from "react";
import {
  getRestaurantsRequest,
  getRestaurantRequest,
  createRestaurantRequest,
  updateRestaurantRequest,
  deleteRestaurantRequest,
  getRestaurantStatsRequest,
} from "../api/restaurants"; // Crearemos este archivo después
import { useAuth } from "./AuthContext";
import axios from "axios";

const RestaurantContext = createContext();

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error("useRestaurant must be used within a RestaurantProvider");
  }
  return context;
};

export const RestaurantProvider = ({ children }) => {
  const { user } = useAuth();

  const [restaurants, setRestaurants] = useState([]);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => setErrors([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  // ✅ Cargar restaurantes automáticamente si es Developer
  useEffect(() => {
    if (user?.role === 3) {
      getRestaurants();
    }
  }, [user]);

  // ✅ Establecer restaurante actual basado en el usuario
  // ✅ Cargar restaurantes automáticamente SOLO si es Developer (Rol 3)
  useEffect(() => {
    // ANTES: if (user?.role === 1)
    if (user?.role === 3) {
      getRestaurants();
    }
  }, [user]);

  // ✅ Establecer restaurante actual al cargar usuario
  useEffect(() => {
    if (user) {
      // 👑 CASO 1: DEVELOPER (Rol 3)
      // La fuente de verdad es el localStorage (para sobrevivir al F5)
      if (user.role === 3) {
        console.log("[RestaurantContext] Developer detectado");

        const savedId = localStorage.getItem("selectedRestaurantId");

        if (savedId) {
          console.log(
            `[RestaurantContext] Restaurando sesión en restaurante ID: ${savedId}`
          );
          getRestaurant(savedId)
            .then((data) => setCurrentRestaurant(data))
            .catch((error) => {
              console.warn(
                "No se pudo recuperar el restaurante guardado, limpiando...",
                error
              );
              localStorage.removeItem("selectedRestaurantId");
              setCurrentRestaurant(null);
            });
        } else {
          // Si no hay nada guardado, estamos en modo Global
          setCurrentRestaurant(null);
        }
      }

      // 🏢 CASO 2: ADMIN O EMPLEADO (Rol 1 o 2)
      // La fuente de verdad es SIEMPRE la base de datos (user.restaurant_id)
      else if (user.restaurant_id) {
        getRestaurant(user.restaurant_id)
          .then((data) => setCurrentRestaurant(data))
          .catch((err) => console.error(err));
      }
    }
  }, [user]);
  
  const getRestaurants = async () => {
    try {
      setLoading(true);
      const res = await getRestaurantsRequest();
      setRestaurants(Array.isArray(res.data) ? res.data : []);
      return res.data;
    } catch (error) {
      console.error("[RestaurantContext] Error fetching restaurants:", error);
      setErrors(error.response?.data || ["Error loading restaurants"]);
      setRestaurants([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getRestaurant = async (id) => {
    try {
      const res = await getRestaurantRequest(id);
      return res.data;
    } catch (error) {
      console.error("[RestaurantContext] Error fetching restaurant:", error);
      setErrors(error.response?.data || ["Error loading restaurant"]);
      throw error;
    }
  };

  const createRestaurant = async (restaurantData) => {
    try {
      const res = await createRestaurantRequest(restaurantData);
      setRestaurants((prev) => [...prev, res.data.restaurant]);
      return res.data;
    } catch (error) {
      console.error("[RestaurantContext] Error creating restaurant:", error);
      setErrors(error.response?.data || ["Error creating restaurant"]);
      throw error;
    }
  };

  const updateRestaurant = async (id, restaurantData) => {
    try {
      const res = await updateRestaurantRequest(id, restaurantData);
      setRestaurants((prev) =>
        prev.map((r) => (r.restaurant_id === id ? res.data.restaurant : r))
      );
      return res.data;
    } catch (error) {
      console.error("[RestaurantContext] Error updating restaurant:", error);
      setErrors(error.response?.data || ["Error updating restaurant"]);
      throw error;
    }
  };

  const deleteRestaurant = async (id) => {
    try {
      await deleteRestaurantRequest(id);
      setRestaurants((prev) => prev.filter((r) => r.restaurant_id !== id));
      return { message: "Restaurant deleted" };
    } catch (error) {
      console.error("[RestaurantContext] Error deleting restaurant:", error);
      setErrors(error.response?.data || ["Error deleting restaurant"]);
      throw error;
    }
  };

  const getRestaurantStats = async (id) => {
    try {
      const res = await getRestaurantStatsRequest(id);
      return res.data;
    } catch (error) {
      console.error("[RestaurantContext] Error fetching stats:", error);
      setErrors(error.response?.data || ["Error loading stats"]);
      throw error;
    }
  };

  // ✅ Función para que Developer "entre" a un restaurante específico
  const selectRestaurant = (restaurant) => {
    setCurrentRestaurant(restaurant);
    localStorage.setItem("selectedRestaurantId", restaurant.restaurant_id);
  };

  // ✅ Función para que Developer "salga" del restaurante
  const clearRestaurantSelection = () => {
    setCurrentRestaurant(null);
    localStorage.removeItem("selectedRestaurantId");
  };

  // ✅ Recuperar selección de localStorage al recargar
  useEffect(() => {
    const savedRestaurantId = localStorage.getItem("selectedRestaurantId");
    if (savedRestaurantId && user?.role === 1) {
      getRestaurant(savedRestaurantId)
        .then((data) => setCurrentRestaurant(data))
        .catch(() => localStorage.removeItem("selectedRestaurantId"));
    }
  }, [user]);

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        currentRestaurant,
        loading,
        errors,
        getRestaurants,
        getRestaurant,
        createRestaurant,
        updateRestaurant,
        deleteRestaurant,
        getRestaurantStats,
        selectRestaurant,
        clearRestaurantSelection,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export default RestaurantContext;
