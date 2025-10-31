// src/components/layouts/DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useState } from "react";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 md:ml-64">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />{" "}
        {/* ✅ Alterna el estado */}
        <main className="p-4 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
