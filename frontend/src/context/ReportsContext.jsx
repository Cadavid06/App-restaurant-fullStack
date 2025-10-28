import { createContext, useContext, useState, useEffect } from "react";
import { getReportsRequest } from "../api/reports";

const ReportsContext = createContext();

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error("useReports must be used within a ReportsProvider");
  }
  return context;
};

export const ReportsProvider = ({ children }) => {
  const [reports, setReports] = useState(null);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => setErrors([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  const getReports = async (startDate, endDate) => {
    try {
      const res = await getReportsRequest(startDate, endDate);
      setReports(res.data);
      return res.data;
    } catch (error) {
      console.error("[v0] Error fetching reports:", error);
      setErrors(error.response?.data || ["Unexpected error"]);
      throw error;
    }
  };

  return (
    <ReportsContext.Provider value={{ reports, getReports, errors }}>
      {children}
    </ReportsContext.Provider>
  );
};