import { createContext, useContext, useState, useEffect } from "react";
import {
  getUsersRequest,
  getUserRequest,
  updateUsersRequest,
  deleteUsersRequest,
} from "../api/users";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => setErrors([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  const getUsers = async () => {
    try {
      const res = await getUsersRequest();
      setUsers(res.data);
      return res.data;
    } catch (error) {
      console.error("[v0] Error fetching users:", error);
      setErrors(error.response?.data || ["Unexpected error"]);
      throw error;
    }
  };

  const getUser = async (id) => {
    try {
      const res = await getUserRequest(id);
      return res.data;
    } catch (error) {
      console.error("[v0] Error fetching user:", error);
      setErrors(error.response?.data || ["Unexpected error"]);
      throw error;
    }
  };

  const updateUser = async (id, userData) => {
    try {
      const res = await updateUsersRequest(id, userData);
      setUsers((prev) =>
        prev.map((u) => (u.user_id === id ? res.data.user : u))
      );
      return res.data;
    } catch (error) {
      console.error("[v0] Error updating user:", error);
      setErrors(error.response?.data || ["Unexpected error"]);
      throw error;
    }
  };

  const deleteUser = async (id) => {
    try {
      await deleteUsersRequest(id);
      setUsers((prev) => prev.filter((u) => u.user_id !== id));
      return { message: "User deleted" };
    } catch (error) {
      console.error("[v0] Error deleting user:", error);
      setErrors(error.response?.data || ["Unexpected error"]);
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{ users, getUsers, getUser, updateUser, deleteUser, errors }}
    >
      {children}
    </UserContext.Provider>
  );
};
