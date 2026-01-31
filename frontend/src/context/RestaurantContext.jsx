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

  // ✅ Cargar restaurantes automáticamente si es Developer (un único efecto)
  useEffect(() => {
    if (user?.role === 3) {
      getRestaurants();
    }
  }, [user?.role]);

  // ✅ Establecer restaurante actual al cargar usuario
  useEffect(() => {
    if (!user) {
      setCurrentRestaurant(null);
      return;
    }

    // 👑 DEVELOPER (Rol 3)
    if (user.role === 3) {
      const savedId = localStorage.getItem("selectedRestaurantId");
      if (savedId) {
        getRestaurant(savedId)
          .then((data) => setCurrentRestaurant(data))
          .catch((error) => {
            console.warn("No se pudo recuperar el restaurante guardado:", error);
            localStorage.removeItem("selectedRestaurantId");
            setCurrentRestaurant(null);
          });
      } else {
        setCurrentRestaurant(null);
      }
    }
    // 🏢 ADMIN O EMPLEADO (Rol 1 o 2)
    else if (user.restaurant_id) {
      getRestaurant(user.restaurant_id)
        .then((data) => setCurrentRestaurant(data))
        .catch((err) => {
          console.error("Error cargando restaurante del usuario:", err);
          setCurrentRestaurant(null);
        });
    } else {
      setCurrentRestaurant(null);
    }
  }, [user?.role, user?.restaurant_id]);
  
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

  // ✅ Recuperar selección de localStorage al recargar (solo Developer)
  useEffect(() => {
    const savedRestaurantId = localStorage.getItem("selectedRestaurantId");
    if (savedRestaurantId && user?.role === 3) {
      getRestaurant(savedRestaurantId)
        .then((data) => setCurrentRestaurant(data))
        .catch((error) => {
          console.warn("No se pudo recuperar el restaurante guardado:", error);
          localStorage.removeItem("selectedRestaurantId");
          setCurrentRestaurant(null);
        });
    }
  }, [user?.role]);

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
