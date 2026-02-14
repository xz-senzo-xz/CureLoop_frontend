import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, Bell, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PatientNavbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side - can add breadcrumbs or page title here */}
        <div className="flex-1">
          {/* Empty for now, can add breadcrumbs later */}
        </div>

        {/* Right side - User info and actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600"></span>
          </button>

          {/* Settings */}
          <button 
            onClick={() => navigate("/patient/profile")}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <User className="h-5 w-5" />
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-gray-900">{user?.name || "Patient"}</p>
              <p className="text-xs text-gray-500">{user?.email || ""}</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PatientNavbar;

