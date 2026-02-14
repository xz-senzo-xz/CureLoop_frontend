import React from "react";
import { Outlet } from "react-router-dom";
import DoctorSidebar from "@/components/DoctorSidebar";
import DoctorNavbar from "@/components/DoctorNavbar";

const DoctorLayout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <DoctorSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DoctorNavbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
