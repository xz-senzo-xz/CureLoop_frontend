import React from "react";
import { mockPatients, mockAppointments } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Activity, TrendingUp } from "lucide-react";

const DoctorDashboard = () => {
  const { user } = useAuth();

  const activePatients = mockPatients.filter((p) => p.status === "active" || p.status === "attention").length;
  const avgAdherence = Math.round(mockPatients.reduce((a, p) => a + p.adherenceRate, 0) / mockPatients.length);
  const upcomingAppointments = mockAppointments.filter(a => a.status === "upcoming").length;

  return (
    <div className="h-full bg-white p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-gray-500">Welcome back,</p>
          <h1 className="mb-6 text-2xl font-semibold text-gray-900">{user?.name || "Doctor"}</h1>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Patients</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{mockPatients.length}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <Users className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Cases</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{activePatients}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Activity className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Avg. Adherence</p>
                    <p className="mt-2 text-3xl font-bold text-red-600">{avgAdherence}%</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <TrendingUp className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
