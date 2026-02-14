import React, { useState, useMemo } from "react";
import { mockMedications, mockMedicationLogs } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Clock, Pill, AlertCircle } from "lucide-react";
import { format, parseISO, isSameDay, subDays } from "date-fns";

const PatientCalendar = () => {
  const today = new Date("2026-02-14");
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  // Calculate adherence for calendar display
  const calendarModifiers = useMemo(() => {
    const highAdherence: Date[] = [];
    const mediumAdherence: Date[] = [];
    const lowAdherence: Date[] = [];
    const noData: Date[] = [];

    for (let i = 0; i < 30; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayLogs = mockMedicationLogs.filter(l => l.date === dateStr && l.status !== "upcoming");
      
      if (dayLogs.length === 0) {
        noData.push(date);
        continue;
      }
      
      const rate = (dayLogs.filter(l => l.status === "taken").length / dayLogs.length) * 100;
      
      if (rate >= 90) highAdherence.push(date);
      else if (rate >= 60) mediumAdherence.push(date);
      else lowAdherence.push(date);
    }

    return { highAdherence, mediumAdherence, lowAdherence, noData };
  }, [today]);

  // Get medications for selected date
  const selectedDateData = useMemo(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const logs = mockMedicationLogs
      .filter(l => l.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
    
    const taken = logs.filter(l => l.status === "taken").length;
    const missed = logs.filter(l => l.status === "missed").length;
    const upcoming = logs.filter(l => l.status === "upcoming").length;
    const total = logs.length;
    const rate = total > 0 ? Math.round((taken / total) * 100) : 0;

    return { logs, taken, missed, upcoming, total, rate };
  }, [selectedDate]);

  const getMedicationDetails = (medId: string) => {
    return mockMedications.find(m => m.id === medId);
  };

  const groupByTime = (logs: typeof mockMedicationLogs) => {
    const morning = logs.filter(l => parseInt(l.time.split(':')[0]) < 12);
    const afternoon = logs.filter(l => {
      const hour = parseInt(l.time.split(':')[0]);
      return hour >= 12 && hour < 17;
    });
    const evening = logs.filter(l => parseInt(l.time.split(':')[0]) >= 17);
    
    return { morning, afternoon, evening };
  };

  const timeGroups = groupByTime(selectedDateData.logs);

  const TimeSection = ({ title, logs, icon }: { title: string; logs: typeof mockMedicationLogs; icon: React.ReactNode }) => {
    if (logs.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <Badge variant="secondary" className="text-xs">{logs.length}</Badge>
        </div>
        
        <div className="space-y-2">
          {logs.map((log) => {
            const med = getMedicationDetails(log.medicationId);
            if (!med) return null;

            return (
              <div
                key={log.id}
                className={`flex items-start gap-3 rounded-lg border-2 p-4 transition-all ${
                  log.status === "taken"
                    ? "border-red-200 bg-red-50"
                    : log.status === "missed"
                    ? "border-gray-300 bg-gray-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                    log.status === "taken"
                      ? "bg-red-600 text-white"
                      : log.status === "missed"
                      ? "bg-gray-400 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {log.status === "taken" ? (
                    <Check className="h-5 w-5" />
                  ) : log.status === "missed" ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900">{med.name}</h4>
                      <p className="text-sm text-gray-600">{med.dosage}</p>
                    </div>
                    <Badge
                      variant={log.status === "taken" ? "default" : log.status === "missed" ? "secondary" : "outline"}
                      className={log.status === "taken" ? "bg-red-600" : ""}
                    >
                      {log.status}
                    </Badge>
                  </div>
                  
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {log.time}
                    </span>
                    <span>{med.frequency}</span>
                  </div>

                  {med.notes && (
                    <div className="mt-2 flex items-start gap-1.5 rounded bg-white p-2 text-xs text-gray-600 border border-gray-200">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0 text-gray-400" />
                      <span>{med.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Medication Calendar</h1>
          <p className="text-gray-600">Track your medication schedule and adherence</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Calendar Section */}
          <div className="lg:col-span-1">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Select Date</CardTitle>
                <CardDescription>View medication schedule for any day</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-lg border border-gray-200"
                  modifiers={calendarModifiers}
                  modifiersClassNames={{
                    highAdherence: "bg-red-100 text-red-900 font-semibold hover:bg-red-200",
                    mediumAdherence: "bg-orange-100 text-orange-900 font-semibold hover:bg-orange-200",
                    lowAdherence: "bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300",
                    noData: "text-gray-300",
                  }}
                  disabled={(date) => date > today || date < subDays(today, 30)}
                />
                
                {/* Legend */}
                <div className="mt-6 space-y-2 rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold text-gray-700 uppercase">Legend</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-red-600"></div>
                      <span className="text-gray-600">≥90% adherence</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-orange-400"></div>
                      <span className="text-gray-600">60-89% adherence</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-gray-400"></div>
                      <span className="text-gray-600">&lt;60% adherence</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Schedule Section */}
          <div className="lg:col-span-2">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-gray-900">
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </CardTitle>
                    <CardDescription>
                      {selectedDateData.total} medication{selectedDateData.total !== 1 ? "s" : ""} scheduled
                    </CardDescription>
                  </div>
                  
                  {selectedDateData.total > 0 && (
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        selectedDateData.rate >= 90 ? "text-red-600" :
                        selectedDateData.rate >= 60 ? "text-orange-600" : "text-gray-600"
                      }`}>
                        {selectedDateData.rate}%
                      </div>
                      <div className="text-xs text-gray-500">adherence</div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedDateData.total === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Pill className="mb-4 h-16 w-16 text-gray-300" />
                    <p className="text-lg font-medium text-gray-900">No medications scheduled</p>
                    <p className="text-sm text-gray-500">Select a different date to view schedule</p>
                  </div>
                ) : (
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-600"></div>
                        <span className="text-gray-600">{selectedDateData.taken} taken</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                        <span className="text-gray-600">{selectedDateData.missed} missed</span>
                      </div>
                      {selectedDateData.upcoming > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-gray-200 border-2 border-gray-400"></div>
                          <span className="text-gray-600">{selectedDateData.upcoming} upcoming</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6">
                    <TimeSection
                      title="Morning"
                      logs={timeGroups.morning}
                      icon={<span className="text-xl">🌅</span>}
                    />
                    <TimeSection
                      title="Afternoon"
                      logs={timeGroups.afternoon}
                      icon={<span className="text-xl">☀️</span>}
                    />
                    <TimeSection
                      title="Evening"
                      logs={timeGroups.evening}
                      icon={<span className="text-xl">🌙</span>}
                    />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientCalendar;

