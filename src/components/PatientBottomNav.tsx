import React from "react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { Home, Pill, Calendar, User } from "lucide-react";

const tabs = [
  { label: "Home", path: "/patient", icon: Home },
  { label: "Meds", path: "/patient/medications", icon: Pill },
  { label: "Appointments", path: "/patient/appointments", icon: Calendar },
  { label: "Profile", path: "/patient/profile", icon: User },
];

const PatientBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-card px-2 pb-safe">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <RouterNavLink
              key={tab.path}
              to={tab.path}
              className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-[10px] transition-colors ${
                active ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              <tab.icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
              {tab.label}
            </RouterNavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default PatientBottomNav;
