import React from "react";
import { useNavigate } from "react-router-dom";
import { mockPatients } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, Plus, Phone, Calendar } from "lucide-react";

const DoctorPatients = () => {
  const navigate = useNavigate();

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-red-100 text-red-700 border-red-200";
      case "stable": return "bg-gray-100 text-gray-700 border-gray-200";
      case "attention": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="h-full bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
          <p className="mt-1 text-sm text-gray-600">{mockPatients.length} total patients</p>
        </div>
        <Button 
          className="bg-red-600 hover:bg-red-700" 
          onClick={() => navigate("/doctor/consultation")}
        >
          <Plus className="mr-2 h-4 w-4" /> New Consultation
        </Button>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockPatients.map((patient) => (
          <Card 
            key={patient.id}
            className="border-gray-200 shadow-sm transition-all hover:shadow-md cursor-pointer"
            onClick={() => navigate(`/doctor/patient/${patient.id}`)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
                  {patient.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium border ${statusColor(patient.status)}`}>
                  {patient.status}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-1">{patient.name}</h3>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  {patient.age} years · {patient.gender}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Last visit: {patient.lastVisit}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-medium text-gray-700 mb-1">Conditions</p>
                <p className="text-sm text-gray-600">{patient.conditions.join(", ")}</p>
              </div>

              <div className="mb-4">
                <p className="text-xs font-medium text-gray-700 mb-1">Adherence</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        patient.adherenceRate >= 80 ? "bg-green-500" : 
                        patient.adherenceRate >= 60 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${patient.adherenceRate}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{patient.adherenceRate}%</span>
                </div>
              </div>

              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/doctor/consultation?patientId=${patient.id}`);
                }}
              >
                <Stethoscope className="mr-2 h-4 w-4" /> Start Consultation
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DoctorPatients;

