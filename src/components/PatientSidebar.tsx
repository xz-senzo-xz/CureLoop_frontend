import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Pill, User, Activity, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Dashboard", path: "/patient", icon: Home },
  { name: "Medications", path: "/patient/medications", icon: Pill },
  { name: "Profile", path: "/patient/profile", icon: User },
];

const PatientSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSignOut = () => {
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
            <h2 className="text-sm font-semibold text-gray-900">Patient Portal</h2>
            <p className="text-xs text-gray-500">Health Tracking</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.path;
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

      {/* Sign Out Button */}
      <div className="p-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-5 w-5 text-gray-400" />
          Sign Out
        </button>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <p className="text-xs text-gray-400 text-center">
          © 2026 Health Tracker
        </p>
      </div>
    </div>
  );
};

export default PatientSidebar;

