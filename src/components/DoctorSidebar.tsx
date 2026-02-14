import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Users, Stethoscope, LogOut, Activity, User,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", path: "/doctor", icon: LayoutDashboard },
  { name: "Patients", path: "/doctor/patients", icon: Users },
  { name: "Consultation", path: "/doctor/consultation", icon: Stethoscope },
];

const DoctorSidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-gray-200 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Doctor Portal</h2>
            <p className="text-xs text-gray-500">Health Management</p>
          </div>
        </div>
      </div>

      {/* User Info */}


      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === "/doctor" && location.pathname === "/doctor");
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                ? "bg-red-50 text-red-600"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-red-600" : "text-gray-400"}`} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut className="h-5 w-5 text-gray-400" />
          Sign Out
        </button>
        <p className="mt-4 text-xs text-gray-400 text-center">
          © 2026 Health Tracker
        </p>
      </div>
    </div>
  );
};

export default DoctorSidebar;
