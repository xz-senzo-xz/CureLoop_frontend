import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import DoctorLayout from "./layouts/DoctorLayout";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorPatients from "./pages/DoctorPatients";
import DoctorConsultation from "./pages/DoctorConsultation";
import DoctorPatientView from "./pages/DoctorPatientView";
import PatientLayout from "./layouts/PatientLayout";
import PatientDashboard from "./pages/PatientDashboard";
import PatientMedications from "./pages/PatientMedications";
import PatientCalendar from "./pages/PatientCalendar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user?.role === "doctor" ? "/doctor" : "/patient"} replace />} />

      {/* Doctor routes */}
      <Route path="/doctor" element={<DoctorLayout />}>
        <Route index element={<DoctorDashboard />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="consultation" element={<DoctorConsultation />} />
        <Route path="patient/:patientId" element={<DoctorPatientView />} />
      </Route>

      {/* Patient routes */}
      <Route path="/patient" element={<PatientLayout />}>
        <Route index element={<PatientDashboard />} />
        <Route path="medications" element={<PatientMedications />} />
        <Route path="calendar" element={<PatientCalendar />} />
        <Route path="appointments" element={<div className="p-6"><h1 className="font-display text-2xl font-bold">Appointments</h1><p className="mt-2 text-muted-foreground">Coming soon</p></div>} />
        <Route path="profile" element={<div className="p-6"><h1 className="font-display text-2xl font-bold">Profile</h1><p className="mt-2 text-muted-foreground">Coming soon</p></div>} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
