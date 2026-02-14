import React, { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { mockMedications, mockMedicationLogs, mockCheckIns, mockAppointments } from "@/lib/mock-data";
import { MedicationLog } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Pill, Check, X, Clock, Calendar, 
  TrendingUp, Activity, Award, AlertCircle,
  Sun, Moon, CloudSun
} from "lucide-react";
import { format, subDays } from "date-fns";

const PatientDashboard = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<MedicationLog[]>(mockMedicationLogs);
  
  const today = new Date("2026-02-14");
  const todayStr = format(today, "yyyy-MM-dd");

  // Today's medications
  const todayLogs = useMemo(() => {
    return logs
      .filter(l => l.date === todayStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [logs, todayStr]);

  // Calculate adherence
  const adherenceMetrics = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(today, i), "yyyy-MM-dd"));
    const last30Days = Array.from({ length: 30 }, (_, i) => format(subDays(today, i), "yyyy-MM-dd"));

    const calculate = (dates: string[]) => {
      const relevantLogs = logs.filter(l => dates.includes(l.date) && l.status !== "upcoming");
      const taken = relevantLogs.filter(l => l.status === "taken").length;
      const total = relevantLogs.length;
      return { taken, total, rate: total > 0 ? Math.round((taken / total) * 100) : 0 };
    };

    const todayMetrics = calculate([todayStr]);
    
    return {
      today: todayMetrics,
      week: calculate(last7Days),
      month: calculate(last30Days),
    };
  }, [logs, today, todayStr]);

  // Streak calculation
  const currentStreak = useMemo(() => {
    let streak = 0;
    for (let i = 1; i < 30; i++) {
      const date = format(subDays(today, i), "yyyy-MM-dd");
      const dayLogs = logs.filter(l => l.date === date && l.status !== "upcoming");
      const dayRate = dayLogs.length > 0 
        ? (dayLogs.filter(l => l.status === "taken").length / dayLogs.length) * 100 
        : 0;
      
      if (dayRate >= 75) streak++;
      else break;
    }
    return streak;
  }, [logs, today]);

  // Next appointment
  const nextAppointment = mockAppointments.find(
    a => a.patientId === "pat-1" && a.status === "upcoming"
  );

  // Today's check-in
  const todayCheckIn = mockCheckIns.find(c => c.date === todayStr);

  const markMedication = (logId: string, status: "taken" | "missed") => {
    setLogs(prev => prev.map(l => l.id === logId ? { ...l, status } : l));
  };

  const getMedName = (medId: string) => mockMedications.find(m => m.id === medId);

  const getTimeIcon = (time: string) => {
    const hour = parseInt(time.split(":")[0]);
    if (hour < 12) return <Sun className="h-4 w-4 text-amber-500" />;
    if (hour < 17) return <CloudSun className="h-4 w-4 text-orange-400" />;
    return <Moon className="h-4 w-4 text-indigo-500" />;
  };

  return (
    <div className="h-full bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-gray-500">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},</p>
          <h1 className="mb-6 text-3xl font-bold text-gray-900">{user?.name || "Patient"}</h1>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Today's Adherence</p>
                    <p className="mt-2 text-3xl font-bold text-red-600">{adherenceMetrics.today.rate}%</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {adherenceMetrics.today.taken}/{adherenceMetrics.today.total} medications
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <Activity className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Weekly Average</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{adherenceMetrics.week.rate}%</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {adherenceMetrics.week.taken}/{adherenceMetrics.week.total} doses
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <TrendingUp className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Current Streak</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{currentStreak}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      consecutive days
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Award className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Today's Medications */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                      <Pill className="h-5 w-5 text-red-600" />
                      Today's Medications
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {format(today, "EEEE, MMMM d, yyyy")}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-gray-600">
                    {todayLogs.length} doses
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {todayLogs.length === 0 ? (
                  <div className="py-12 text-center">
                    <Pill className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">No medications scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayLogs.map((log) => {
                      const med = getMedName(log.medicationId);
                      if (!med) return null;
                      
                      return (
                        <div
                          key={log.id}
                          className={`flex items-center gap-4 rounded-lg border-2 p-4 transition-all ${
                            log.status === "taken"
                              ? "border-red-200 bg-red-50"
                              : log.status === "missed"
                              ? "border-gray-300 bg-gray-50"
                              : "border-gray-200 bg-white hover:border-red-200"
                          }`}
                        >
                          <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${
                            log.status === "taken"
                              ? "bg-red-600 text-white"
                              : log.status === "missed"
                              ? "bg-gray-400 text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {log.status === "taken" ? (
                              <Check className="h-6 w-6" />
                            ) : log.status === "missed" ? (
                              <X className="h-6 w-6" />
                            ) : (
                              getTimeIcon(log.time)
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{med.name}</h3>
                              {log.status === "taken" && (
                                <Badge className="bg-red-600 text-xs">Taken</Badge>
                              )}
                              {log.status === "missed" && (
                                <Badge variant="secondary" className="text-xs">Missed</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {med.dosage} • {log.time}
                            </p>
                          </div>

                          {log.status === "upcoming" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => markMedication(log.id, "taken")}
                              >
                                <Check className="mr-1 h-4 w-4" /> Mark Taken
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markMedication(log.id, "missed")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly Progress */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">30-Day Progress</CardTitle>
                <CardDescription>Your medication adherence over the past month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Overall Adherence</span>
                      <span className="text-lg font-bold text-red-600">{adherenceMetrics.month.rate}%</span>
                    </div>
                    <Progress value={adherenceMetrics.month.rate} className="h-3" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4">
                    <div>
                      <p className="text-xs text-gray-500">Taken</p>
                      <p className="text-xl font-bold text-red-600">{adherenceMetrics.month.taken}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Missed</p>
                      <p className="text-xl font-bold text-gray-600">
                        {adherenceMetrics.month.total - adherenceMetrics.month.taken}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-xl font-bold text-gray-900">{adherenceMetrics.month.total}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* Next Appointment */}
            {nextAppointment && (
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Next Appointment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-red-100">
                      <Calendar className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{nextAppointment.type}</p>
                      <p className="mt-1 text-sm text-gray-600">{nextAppointment.date}</p>
                      <p className="text-sm text-gray-600">{nextAppointment.time}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* How Are You Feeling? */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">How are you feeling?</CardTitle>
                <CardDescription>Daily check-in</CardDescription>
              </CardHeader>
              <CardContent>
                {todayCheckIn ? (
                  <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {todayCheckIn.mood === "great" ? "😊" : 
                         todayCheckIn.mood === "good" ? "🙂" : 
                         todayCheckIn.mood === "okay" ? "😐" : "😞"}
                      </span>
                      <div>
                        <p className="font-semibold capitalize text-gray-900">{todayCheckIn.mood}</p>
                        {todayCheckIn.symptoms.length > 0 && (
                          <p className="text-sm text-gray-600">{todayCheckIn.symptoms.join(", ")}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {(["great", "good", "okay", "bad"] as const).map((mood) => (
                      <button
                        key={mood}
                        className="flex flex-col items-center gap-2 rounded-lg border-2 border-gray-200 p-3 transition-all hover:border-red-300 hover:bg-red-50"
                      >
                        <span className="text-2xl">
                          {mood === "great" ? "😊" : mood === "good" ? "🙂" : mood === "okay" ? "😐" : "😞"}
                        </span>
                        <span className="text-xs font-medium capitalize text-gray-700">{mood}</span>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span>Take medications at the same time daily</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span>Set reminders on your phone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span>Keep a medication log updated</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span>Contact your doctor if you miss multiple doses</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
