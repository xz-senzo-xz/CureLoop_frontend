import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockPatients, mockMedicationLogs, mockMedications, mockCheckIns, mockConsultationNotes } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronLeft, AlertCircle, Calendar, FileText, Pill, Stethoscope, Clock, CheckCircle2 } from "lucide-react";

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
  const takenLogs = mockMedicationLogs.filter((l) => l.status === "taken");
  const patientCheckIns = mockCheckIns.filter((c) => c.patientId === patientId).sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const notes = mockConsultationNotes.filter((n) => n.patientId === patientId).sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-red-100 text-red-700 border-red-200";
      case "stable": return "bg-green-100 text-green-700 border-green-200";
      case "attention": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Back Button */}
        <button
          onClick={() => navigate("/doctor/patients")}
          className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Patients
        </button>

        {/* Patient Header */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-600">
                {patient.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
                  <Badge className={statusColor(patient.status)}>
                    {patient.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {patient.age}y · {patient.gender} · {patient.conditions.join(", ")}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {patient.phone} · Vital ID: {patient.vitalId}
                </p>
              </div>
            </div>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => navigate(`/doctor/consultation?patientId=${patient.id}`)}
            >
              <Stethoscope className="mr-2 h-4 w-4" /> New Consultation
            </Button>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Adherence Rate</p>
              <p className={`text-2xl font-bold ${patient.adherenceRate >= 80 ? "text-green-600" :
                patient.adherenceRate >= 60 ? "text-orange-600" : "text-red-600"
                }`}>
                {patient.adherenceRate}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Total Check-ins</p>
              <p className="text-2xl font-bold text-gray-900">{patientCheckIns.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Consultations</p>
              <p className="text-2xl font-bold text-gray-900">{notes.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Last Visit</p>
              <p className="text-sm font-semibold text-gray-900">{patient.lastVisit}</p>
            </div>
          </div>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-white border border-gray-200 p-1 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="medications" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              Medications
            </TabsTrigger>
            <TabsTrigger value="checkins" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              Check-ins
            </TabsTrigger>
            <TabsTrigger value="consultations" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              Consultations
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent Activity Summary */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-red-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {patientCheckIns.length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Last Check-in</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {patientCheckIns[0].date} - Mood: <span className="capitalize font-medium">{patientCheckIns[0].mood}</span>
                        </p>
                      </div>
                    </div>
                  )}
                  {notes.length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <FileText className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Last Consultation</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {notes[0].date} - {notes[0].diagnosis}
                        </p>
                      </div>
                    </div>
                  )}
                  {missedLogs.length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Attention Needed</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {missedLogs.length} missed dose{missedLogs.length !== 1 ? 's' : ''} recorded
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Current Status */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-red-600" />
                    Progress Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Medication Adherence</span>
                      <span className="text-sm font-semibold text-gray-900">{patient.adherenceRate}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${patient.adherenceRate >= 80 ? "bg-green-500" :
                          patient.adherenceRate >= 60 ? "bg-orange-500" : "bg-red-500"
                          }`}
                        style={{ width: `${patient.adherenceRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Doses taken</span>
                      <span className="text-sm font-medium text-green-600">{takenLogs.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Doses missed</span>
                      <span className="text-sm font-medium text-red-600">{missedLogs.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Check-in frequency</span>
                      <span className="text-sm font-medium text-gray-900">
                        {patientCheckIns.length > 0 ? `${patientCheckIns.length} recorded` : 'No data'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Latest Consultation Note */}
            {notes.length > 0 && (
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-600" />
                    Latest Consultation ({notes[0].date})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Diagnosis</p>
                      <p className="text-sm text-gray-900">{notes[0].diagnosis}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Chief Complaint</p>
                      <p className="text-sm text-gray-900">{notes[0].chiefComplaint}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Treatment Plan</p>
                    <p className="text-sm text-gray-900">{notes[0].plan}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications" className="space-y-4">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Pill className="h-4 w-4 text-red-600" />
                  Medication History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Taken Medications */}
                  {takenLogs.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Taken ({takenLogs.length})
                      </h4>
                      <div className="space-y-2">
                        {takenLogs.slice(0, 10).map((log) => {
                          const med = mockMedications.find((m) => m.id === log.medicationId);
                          return (
                            <div
                              key={log.id}
                              className="flex items-center justify-between p-3 rounded-lg border border-green-200 bg-green-50"
                            >
                              <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {med?.name} {med?.dosage}
                                  </p>
                                  <p className="text-xs text-gray-600">{med?.frequency}</p>
                                </div>
                              </div>
                              <span className="text-xs text-gray-600">{log.date} at {log.time}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Missed Medications */}
                  {missedLogs.length > 0 && (
                    <div className="pt-4">
                      <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Missed ({missedLogs.length})
                      </h4>
                      <div className="space-y-2">
                        {missedLogs.slice(0, 10).map((log) => {
                          const med = mockMedications.find((m) => m.id === log.medicationId);
                          return (
                            <div
                              key={log.id}
                              className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50"
                            >
                              <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {med?.name} {med?.dosage}
                                  </p>
                                  <p className="text-xs text-gray-600">{med?.frequency}</p>
                                </div>
                              </div>
                              <span className="text-xs text-gray-600">{log.date} at {log.time}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {takenLogs.length === 0 && missedLogs.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-8">No medication history available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Check-ins Tab */}
          <TabsContent value="checkins" className="space-y-4">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-600" />
                  Patient Check-ins ({patientCheckIns.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patientCheckIns.length > 0 ? (
                  <div className="space-y-3">
                    {patientCheckIns.map((ci) => (
                      <div key={ci.id} className="p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-gray-300 transition-colors">
                        <div className="flex items-start gap-4">
                          <span className="text-4xl">
                            {ci.mood === "great" ? "😊" : ci.mood === "good" ? "🙂" : ci.mood === "okay" ? "😐" : "😞"}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold capitalize text-gray-900">{ci.mood}</p>
                              <span className="text-xs text-gray-500">{ci.date}</span>
                            </div>
                            {ci.symptoms.length > 0 && (
                              <div className="mb-2">
                                <p className="text-xs font-medium text-gray-500 mb-1">Symptoms</p>
                                <div className="flex flex-wrap gap-1">
                                  {ci.symptoms.map((symptom, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                      {symptom}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {ci.notes && (
                              <div className="mt-2 p-2 bg-gray-50 rounded">
                                <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                                <p className="text-sm text-gray-700">{ci.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">No check-ins recorded</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consultations Tab */}
          <TabsContent value="consultations" className="space-y-4">
            {notes.length > 0 ? (
              notes.map((note, idx) => (
                <Card key={note.id} className="border-gray-200 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4 text-red-600" />
                        Consultation {notes.length - idx}
                      </CardTitle>
                      <span className="text-xs text-gray-500">{note.date}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Chief Complaint</p>
                        <p className="text-sm text-gray-900">{note.chiefComplaint}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Diagnosis</p>
                        <p className="text-sm text-gray-900">{note.diagnosis}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Treatment Plan</p>
                      <p className="text-sm text-gray-900">{note.plan}</p>
                    </div>
                    {note.history && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs font-semibold uppercase text-gray-500 mb-1">History</p>
                        <p className="text-sm text-gray-900">{note.history}</p>
                      </div>
                    )}
                    {note.examination && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Examination</p>
                        <p className="text-sm text-gray-900">{note.examination}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="py-8">
                  <p className="text-sm text-gray-500 text-center">No consultation notes available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorPatientView;
