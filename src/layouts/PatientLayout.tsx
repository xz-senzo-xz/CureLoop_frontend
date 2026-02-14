import React from "react";
import { Outlet } from "react-router-dom";
import PatientSidebar from "@/components/PatientSidebar";
import PatientNavbar from "@/components/PatientNavbar";

const PatientLayout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <PatientSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <PatientNavbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PatientLayout;
