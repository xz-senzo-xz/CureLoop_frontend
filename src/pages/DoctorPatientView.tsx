import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockPatients, mockMedicationLogs, mockMedications, mockCheckIns, mockConsultationNotes, weeklyAdherenceData } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, TrendingUp, AlertCircle, Calendar, FileText, Pill, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

const DoctorPatientView = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const patient = mockPatients.find((p) => p.id === patientId);

  if (!patient) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">Patient not found</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate("/doctor")}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const missedLogs = mockMedicationLogs.filter((l) => l.status === "missed");
  const patientCheckIns = mockCheckIns.filter((c) => c.patientId === patientId);
  const notes = mockConsultationNotes.filter((n) => n.patientId === patientId);

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-red-100 text-red-700 border-red-200";
      case "stable": return "bg-gray-100 text-gray-700 border-gray-200";
      case "attention": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="h-full bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <button 
          onClick={() => navigate("/doctor")} 
          className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        {/* Patient Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-600">
            {patient.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
              <Badge className={statusColor(patient.status)}>
                {patient.status}
              </Badge>
            </div>
            <p className="mt-1 text-gray-600">
              {patient.age} years old · {patient.gender} · {patient.conditions.join(", ")}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Phone: {patient.phone} · Last visit: {patient.lastVisit}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Adherence */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                  <TrendingUp className="h-5 w-5 text-red-600" /> Adherence Rate
                </CardTitle>
                <CardDescription>Medication adherence over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-4">
                  <Progress value={patient.adherenceRate} className="h-3 flex-1" />
                  <span className="text-2xl font-bold text-red-600">{patient.adherenceRate}%</span>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyAdherenceData}>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
                      <YAxis hide domain={[0, 100]} />
                      <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                        {weeklyAdherenceData.map((entry, i) => (
                          <Cell 
                            key={i} 
                            fill={entry.rate >= 75 ? "#DC2626" : "#FB923C"} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Missed Doses */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                  <AlertCircle className="h-5 w-5 text-red-600" /> Missed Doses
                </CardTitle>
                <CardDescription>Recent missed medication doses</CardDescription>
              </CardHeader>
              <CardContent>
                {missedLogs.length > 0 ? (
                  <div className="space-y-2">
                    {missedLogs.slice(0, 5).map((log) => {
                      const med = mockMedications.find((m) => m.id === log.medicationId);
                      return (
                        <div 
                          key={log.id} 
                          className="flex items-center justify-between rounded-lg border-2 border-red-200 bg-red-50 p-3"
                        >
                          <div className="flex items-center gap-3">
                            <Pill className="h-5 w-5 text-red-600" />
                            <div>
                              <span className="text-sm font-semibold text-gray-900">
                                {med?.name} {med?.dosage}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-600">{log.date} at {log.time}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No missed doses</p>
                )}
              </CardContent>
            </Card>

            {/* Check-ins */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                  <Calendar className="h-5 w-5 text-red-600" /> Patient Check-ins
                </CardTitle>
                <CardDescription>Daily mood and symptom tracking</CardDescription>
              </CardHeader>
              <CardContent>
                {patientCheckIns.length > 0 ? (
                  <div className="space-y-3">
                    {patientCheckIns.slice(0, 5).map((ci) => (
                      <div key={ci.id} className="flex items-center gap-4 rounded-lg border-2 border-gray-200 bg-white p-4">
                        <span className="text-3xl">
                          {ci.mood === "great" ? "😊" : ci.mood === "good" ? "🙂" : ci.mood === "okay" ? "😐" : "😞"}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold capitalize text-gray-900">{ci.mood}</p>
                            <span className="text-xs text-gray-500">{ci.date}</span>
                          </div>
                          {ci.symptoms.length > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                              Symptoms: {ci.symptoms.join(", ")}
                            </p>
                          )}
                          {ci.notes && (
                            <p className="text-sm text-gray-600 mt-1">{ci.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No check-ins recorded</p>
                )}
              </CardContent>
            </Card>

            {/* Last Consultation Note */}
            {notes[0] && (
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                    <FileText className="h-5 w-5 text-red-600" /> Last Consultation
                  </CardTitle>
                  <CardDescription>Most recent consultation notes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {([
                    ["Complaint", notes[0].chiefComplaint],
                    ["Diagnosis", notes[0].diagnosis],
                    ["Plan", notes[0].plan],
                  ] as const).map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <p className="text-xs font-semibold uppercase text-gray-500 mb-1">{label}</p>
                      <p className="text-sm text-gray-900">{value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* Quick Stats */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                  <Activity className="h-5 w-5 text-red-600" /> Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Adherence Rate</span>
                    <span className="text-lg font-bold text-red-600">{patient.adherenceRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Missed Doses</span>
                    <span className="text-lg font-bold text-gray-900">{missedLogs.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Check-ins</span>
                    <span className="text-lg font-bold text-gray-900">{patientCheckIns.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Consultations</span>
                    <span className="text-lg font-bold text-gray-900">{notes.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Info */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Patient Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500">Age</p>
                    <p className="font-semibold text-gray-900">{patient.age} years</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Gender</p>
                    <p className="font-semibold text-gray-900">{patient.gender}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-semibold text-gray-900">{patient.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Visit</p>
                    <p className="font-semibold text-gray-900">{patient.lastVisit}</p>
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

export default DoctorPatientView;
