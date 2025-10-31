import { createContext, use, useContext, useEffect, useState } from "react";
import {
  CreateCategoriesRequest,
  deleteCategoriesRequest,
  getCategoriesRequest,
  getCategoryRequest,
  updateCategoriesRequest,
} from "../api/categories";
import {
  createProductsRequest,
  deleteProductsRequest,
  getProductRequest,
  getProductsRequest,
  updateProductsRequest,
} from "../api/products";

const AdminContext = createContext();

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminContext must be used within an AuthProvider");
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [category, setCategory] = useState([]);
  const [product, setProduct] = useState([]);
  const [errors, setErrors] = useState();

  useEffect(() => {
    if (errors !== "") {
      const timer = setTimeout(() => {
        setErrors("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [errors]);

  const createCategory = async (category) => {
    try {
      const res = await CreateCategoriesRequest(category);
      setCategory((prev) => [...prev, res.data]);
    } catch (error) {
      console.error(error);
      setErrors(error.response?.data || ["Unexpected error"]);
    }
  };

  const createProducts = async (product) => {
    try {
      const res = await createProductsRequest(product);
      setProduct((prev) => [...prev, res.data]);
    } catch (error) {
      console.error(error);
      setErrors(error.response?.data || ["Unexpected error"]);
    }
  };

  const getCategories = async () => {
    try {
      const res = await getCategoriesRequest();
      setCategory(res.data);
    } catch (error) {
      console.error(error);
      setErrors(error.response?.data || ["Unexpected error"]);
    }
  };

  const getProducts = async () => {
    try {
      const res = await getProductsRequest();
      setProduct(res.data);
    } catch (error) {
      console.error(error);
      setErrors(error.response?.data || ["Unexpected error"]);
    }
  };

  const getCategory = async (id) => {
    try {
      const res = await getCategoryRequest(id);
      return res.data;
    } catch (error) {
      console.error(error);
      setErrors(error.response?.data || ["Unexpected error"]);
    }
  };

  const getProduct = async (id) => {
    try {
      const res = await getProductRequest(id);
      return res.data;
    } catch (error) {
      console.error(error);
      setErrors(error.response?.data || ["Unexpected error"]);
    }
  };

  const updateCategory = async (id, data) => {
    try {
      const res = await updateCategoriesRequest(id, data);
      setCategory((prev) =>
        prev.map((c) => (c.category_id === id ? res.data : c))
      ); // ✅ Cambia c.id a c.category_id
    } catch (error) {
      console.error(error);
      setErrors(error.response?.data || ["Unexpected error"]);
    }
  };
  const updateProduct = async (id, data) => {
    try {
      const res = await updateProductsRequest(id, data);
      setProduct((prev) =>
        prev.map((p) => (p.product_id === id ? res.data : p))
      ); // ✅ Cambia p.id a p.product_id
    } catch (error) {
      console.error(error);
      setErrors(error.response?.data || ["Unexpected error"]);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await deleteCategoriesRequest(id);
      setCategory((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };
  const deleteProduct = async (id) => {
    try {
      await deleteProductsRequest(id);
      setProduct((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        category,
        createCategory,
        getCategories,
        getCategory,
        updateCategory,
        deleteCategory,
        product,
        createProducts,
        getProducts,
        getProduct,
        updateProduct,
        deleteProduct,
        errors,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;
