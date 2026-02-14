import React, { useState, useMemo } from "react";
import { mockMedications, mockMedicationLogs } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Pill, Sun, CloudSun, Moon, Info, Clock, Calendar, AlertCircle } from "lucide-react";
import { format, subDays } from "date-fns";

const PatientMedications = () => {
  const [activeTab, setActiveTab] = useState("active");
  const today = new Date("2026-02-14");

  const activeMedications = mockMedications;

  // Group logs by date for history
  const medicationHistory = useMemo(() => {
    const history: { [key: string]: typeof mockMedicationLogs } = {};

    for (let i = 0; i < 14; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayLogs = mockMedicationLogs.filter(l => l.date === dateStr);

      if (dayLogs.length > 0) {
        history[dateStr] = dayLogs.sort((a, b) => a.time.localeCompare(b.time));
      }
    }

    return history;
  }, [today]);

  const getTimeIcon = (time: string) => {
    const hour = parseInt(time.split(":")[0]);
    if (hour < 12) return <Sun className="h-4 w-4 text-amber-500" />;
    if (hour < 17) return <CloudSun className="h-4 w-4 text-orange-400" />;
    return <Moon className="h-4 w-4 text-indigo-500" />;
  };

  const getTimeLabel = (time: string) => {
    const hour = parseInt(time.split(":")[0]);
    if (hour < 12) return "Morning";
    if (hour < 17) return "Afternoon";
    return "Evening";
  };

  return (
    <div className="h-full bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Medications</h1>
          <p className="text-gray-600">Manage your prescriptions and medication schedule</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Medications</TabsTrigger>
            <TabsTrigger value="schedule">Daily Schedule</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Active Medications Tab */}
          <TabsContent value="active" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {activeMedications.map((med) => (
                <Card key={med.id} className="border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-red-100">
                        <Pill className="h-7 w-7 text-red-600" />
                      </div>

                      <div className="flex-1">
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{med.name}</h3>
                            <p className="text-sm text-gray-600">{med.dosage}</p>
                          </div>
                          <Badge className="bg-red-600">{med.frequency}</Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{getTimeLabel(med.time)} at {med.time}</span>
                            {getTimeIcon(med.time)}
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>Duration: {med.duration}</span>
                          </div>

                          {med.notes && (
                            <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                              <span className="text-xs text-gray-700">{med.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Daily Medication Schedule</CardTitle>
                <CardDescription>Organized by time of day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {["Morning", "Afternoon", "Evening"].map((period) => {
                    const periodMeds = activeMedications.filter((med) => {
                      const hour = parseInt(med.time.split(":")[0]);
                      if (period === "Morning") return hour < 12;
                      if (period === "Afternoon") return hour >= 12 && hour < 17;
                      return hour >= 17;
                    });

                    if (periodMeds.length === 0) return null;

                    return (
                      <div key={period}>
                        <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-2">
                          {period === "Morning" && <Sun className="h-5 w-5 text-amber-500" />}
                          {period === "Afternoon" && <CloudSun className="h-5 w-5 text-orange-400" />}
                          {period === "Evening" && <Moon className="h-5 w-5 text-indigo-500" />}
                          <h3 className="text-lg font-semibold text-gray-900">{period}</h3>
                          <Badge variant="secondary">{periodMeds.length} medication{periodMeds.length !== 1 ? "s" : ""}</Badge>
                        </div>

                        <div className="space-y-3">
                          {periodMeds.map((med) => (
                            <div key={med.id} className="flex items-center gap-4 rounded-lg border-2 border-gray-200 bg-white p-4 transition-all hover:border-red-200">
                              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                <Clock className="h-6 w-6 text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-gray-900">{med.name}</p>
                                    <p className="text-sm text-gray-600">{med.dosage}</p>
                                  </div>
                                  <span className="text-lg font-bold text-red-600">{med.time}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Medication History</CardTitle>
                <CardDescription>Past 14 days of medication logs</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[700px] pr-4">
                  <div className="space-y-4">
                    {Object.entries(medicationHistory).map(([dateStr, logs]) => {
                      const date = new Date(dateStr);
                      const taken = logs.filter(l => l.status === "taken").length;
                      const missed = logs.filter(l => l.status === "missed").length;
                      const total = logs.filter(l => l.status !== "upcoming").length;
                      const rate = total > 0 ? Math.round((taken / total) * 100) : 0;

                      return (
                        <div key={dateStr} className="rounded-lg border-2 border-gray-200 p-5">
                          <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
                            <div>
                              <p className="text-lg font-bold text-gray-900">
                                {format(date, "EEEE, MMMM d, yyyy")}
                              </p>
                              <p className="text-sm text-gray-600">
                                {taken} taken • {missed} missed • {total} total
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${rate >= 90 ? "text-red-600" :
                                  rate >= 60 ? "text-orange-600" : "text-gray-600"
                                }`}>
                                {rate}%
                              </div>
                              <p className="text-xs text-gray-500">adherence</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {logs
                              .filter(l => l.status !== "upcoming")
                              .map((log) => {
                                const med = mockMedications.find(m => m.id === log.medicationId);
                                if (!med) return null;

                                return (
                                  <div
                                    key={log.id}
                                    className={`flex items-center gap-3 rounded-lg border-2 p-3 ${log.status === "taken"
                                        ? "border-red-200 bg-red-50"
                                        : "border-gray-200 bg-gray-50"
                                      }`}
                                  >
                                    <div
                                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${log.status === "taken"
                                          ? "bg-red-600 text-white"
                                          : "bg-gray-400 text-white"
                                        }`}
                                    >
                                      {log.status === "taken" ? (
                                        <Check className="h-5 w-5" />
                                      ) : (
                                        <X className="h-5 w-5" />
                                      )}
                                    </div>

                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-semibold text-gray-900">{med.name}</p>
                                          <p className="text-sm text-gray-600">{med.dosage}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {getTimeIcon(log.time)}
                                          <span className="text-sm font-medium text-gray-700">{log.time}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientMedications;
