import React, { useState, useMemo, useEffect, useRef } from "react";
import { mockMedications, mockMedicationLogs } from "@/lib/mock-data";
import { MedicationLog } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, X, Pill, Sun, CloudSun, Moon, Info, Clock, Calendar as CalendarIcon, AlertCircle, CheckCircle } from "lucide-react";
import { format, subDays } from "date-fns";
import { useLocation } from "react-router-dom";

const PatientMedications = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("track");
  const [logs, setLogs] = useState<MedicationLog[]>(mockMedicationLogs);
  const [highlightedLogId, setHighlightedLogId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    logId: string;
    medicationName: string;
    action: "taken" | "missed";
  } | null>(null);
  const medicationRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date("2026-02-14"));
  
  const today = new Date("2026-02-14");
  const todayStr = format(today, "yyyy-MM-dd");
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const isToday = selectedDateStr === todayStr;

  // Handle navigation from notifications
  useEffect(() => {
    if (location.state?.medicationLogId) {
      const logId = location.state.medicationLogId;
      console.log('Navigation received with logId:', logId);
      
      setActiveTab("track"); // Switch to track tab
      setHighlightedLogId(logId);
      
      // Scroll to the medication
      setTimeout(() => {
        const element = medicationRefs.current[logId];
        if (element) {
          console.log('Scrolling to element for logId:', logId);
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        } else {
          console.log('Element not found for logId:', logId);
        }
      }, 100);

      // Clear highlight after 3 seconds
      setTimeout(() => {
        console.log('Clearing highlight');
        setHighlightedLogId(null);
      }, 3000);

      // Clear location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Selected date medications
  const selectedDayLogs = useMemo(() => {
    return logs
      .filter(l => l.date === selectedDateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [logs, selectedDateStr]);

  const upcomingLogs = useMemo(() => {
    return selectedDayLogs.filter(l => l.status === "upcoming");
  }, [selectedDayLogs]);

  const takenLogs = useMemo(() => {
    return selectedDayLogs.filter(l => l.status === "taken");
  }, [selectedDayLogs]);

  const missedLogs = useMemo(() => {
    return selectedDayLogs.filter(l => l.status === "missed");
  }, [selectedDayLogs]);

  // Group logs by date for history
  const medicationHistory = useMemo(() => {
    const history: { [key: string]: typeof mockMedicationLogs } = {};
    
    for (let i = 0; i < 14; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayLogs = logs.filter(l => l.date === dateStr);
      
      if (dayLogs.length > 0) {
        history[dateStr] = dayLogs.sort((a, b) => a.time.localeCompare(b.time));
      }
    }
    
    return history;
  }, [logs, today]);

  // Calendar modifiers for adherence visualization
  const calendarModifiers = useMemo(() => {
    const highAdherence: Date[] = [];
    const mediumAdherence: Date[] = [];
    const lowAdherence: Date[] = [];
    const noData: Date[] = [];

    for (let i = 0; i < 30; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayLogs = logs.filter(l => l.date === dateStr && l.status !== "upcoming");
      
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
  }, [logs, today]);

  // Get medications for selected date in calendar
  const selectedDateData = useMemo(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const dateLogs = logs
      .filter(l => l.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
    
    const taken = dateLogs.filter(l => l.status === "taken").length;
    const missed = dateLogs.filter(l => l.status === "missed").length;
    const upcoming = dateLogs.filter(l => l.status === "upcoming").length;
    const total = dateLogs.length;
    const rate = total > 0 ? Math.round((taken / total) * 100) : 0;

    return { logs: dateLogs, taken, missed, upcoming, total, rate };
  }, [logs, selectedDate]);

  const groupByTime = (calLogs: typeof mockMedicationLogs) => {
    const morning = calLogs.filter(l => parseInt(l.time.split(':')[0]) < 12);
    const afternoon = calLogs.filter(l => {
      const hour = parseInt(l.time.split(':')[0]);
      return hour >= 12 && hour < 17;
    });
    const evening = calLogs.filter(l => parseInt(l.time.split(':')[0]) >= 17);
    
    return { morning, afternoon, evening };
  };

  const calendarTimeGroups = groupByTime(selectedDateData.logs);

  const markMedication = (logId: string, status: "taken" | "missed") => {
    setLogs(prev => prev.map(l => l.id === logId ? { ...l, status } : l));
    setConfirmDialog(null);
  };

  const handleMarkClick = (logId: string, medName: string, action: "taken" | "missed") => {
    setConfirmDialog({
      open: true,
      logId,
      medicationName: medName,
      action,
    });
  };

  const getMedName = (medId: string) => mockMedications.find(m => m.id === medId);

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
            <TabsTrigger value="track">Track</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Track Tab - Calendar + Daily Schedule */}
          <TabsContent value="track" className="space-y-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Calendar Section */}
              <div className="lg:col-span-1">
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900">Select Date</CardTitle>
                    <CardDescription>
                      {isToday ? "Today's medications" : "View past medications"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-lg border border-gray-200"
                      modifiers={calendarModifiers}
                      modifiersClassNames={{
                        highAdherence: "bg-green-100 text-green-900 font-semibold hover:bg-green-200",
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
                          <div className="h-4 w-4 rounded bg-green-600"></div>
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
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {isToday ? "Track your medications" : "Medication history for this day"}
                    </p>
                  </div>
                  {selectedDayLogs.length > 0 && (
                    <div className="flex gap-2">
                      {isToday && upcomingLogs.length > 0 && (
                        <Badge variant="outline" className="border-orange-300 bg-orange-50 text-orange-700">
                          {upcomingLogs.length} to take
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">
                        {takenLogs.length} completed
                      </Badge>
                    </div>
                  )}
                </div>

            {["Morning", "Afternoon", "Evening"].map((period) => {
              const periodLogs = selectedDayLogs.filter((log) => {
                const hour = parseInt(log.time.split(":")[0]);
                if (period === "Morning") return hour < 12;
                if (period === "Afternoon") return hour >= 12 && hour < 17;
                return hour >= 17;
              });

              if (periodLogs.length === 0) return null;

              const periodIcon = period === "Morning" ? <Sun className="h-5 w-5 text-amber-500" /> 
                : period === "Afternoon" ? <CloudSun className="h-5 w-5 text-orange-400" /> 
                : <Moon className="h-5 w-5 text-indigo-500" />;

              const upcomingCount = periodLogs.filter(l => l.status === "upcoming").length;
              const takenCount = periodLogs.filter(l => l.status === "taken").length;

              return (
                <Card key={period} className="border-gray-200 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {periodIcon}
                        <div>
                          <CardTitle className="text-lg text-gray-900">{period}</CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            {takenCount} of {periodLogs.length} taken
                          </CardDescription>
                        </div>
                      </div>
                      {isToday && upcomingCount > 0 && (
                        <Badge variant="outline" className="border-orange-300 bg-orange-50 text-orange-700">
                          {upcomingCount} pending
                        </Badge>
                      )}
                      {upcomingCount === 0 && periodLogs.length > 0 && (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2.5">
                      {periodLogs.map((log) => {
                        const med = getMedName(log.medicationId);
                        if (!med) return null;

                        const isHighlighted = highlightedLogId !== null && log.id === highlightedLogId;
                        
                        if (isHighlighted) {
                          console.log('Highlighting log:', log.id, 'for medication:', med.name);
                        }

                        return (
                          <div
                            key={log.id}
                            ref={(el) => { medicationRefs.current[log.id] = el; }}
                            className={`flex items-center gap-3 rounded-lg border-2 p-3 transition-all ${
                              log.status === "taken"
                                ? "border-green-200 bg-green-50"
                                : log.status === "missed"
                                ? "border-gray-300 bg-gray-50"
                                : "border-gray-200 bg-white hover:border-orange-300"
                            } ${
                              isHighlighted ? "ring-4 ring-orange-300 ring-opacity-50 animate-pulse" : ""
                            }`}
                          >
                            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                              log.status === "taken"
                                ? "bg-green-600 text-white"
                                : log.status === "missed"
                                ? "bg-gray-400 text-white"
                                : "bg-orange-100 text-orange-600"
                            }`}>
                              {log.status === "taken" ? (
                                <Check className="h-5 w-5" />
                              ) : log.status === "missed" ? (
                                <X className="h-5 w-5" />
                              ) : (
                                <Clock className="h-5 w-5" />
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900">{med.name}</h3>
                                {log.status === "taken" && (
                                  <Badge className="bg-green-600 text-xs">Taken</Badge>
                                )}
                                {log.status === "missed" && (
                                  <Badge variant="secondary" className="text-xs">Missed</Badge>
                                )}
                                {log.status === "upcoming" && (
                                  <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                                    {log.time}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {med.dosage} • {med.frequency}
                                {log.status === "taken" && ` • Taken at ${log.time}`}
                                {!isToday && log.status !== "taken" && ` • Scheduled for ${log.time}`}
                              </p>
                              {med.notes && (isToday ? log.status === "upcoming" : true) && (
                                <p className="text-xs text-orange-600 mt-1">
                                  <Info className="h-3 w-3 inline mr-1" />
                                  {med.notes}
                                </p>
                              )}
                            </div>

                            {/* Show action buttons only for today and upcoming medications */}
                            {isToday && log.status === "upcoming" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleMarkClick(log.id, med.name, "taken")}
                                >
                                  <Check className="mr-1 h-4 w-4" /> Take
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-300 hover:bg-gray-100"
                                  onClick={() => handleMarkClick(log.id, med.name, "missed")}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}

                            {log.status === "taken" && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Missed Section (if any) - only show for today */}
            {isToday && missedLogs.length > 0 && (
              <Card className="border-red-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <CardTitle className="text-lg text-gray-900">Missed Today</CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          Medications you marked as missed
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700">
                      {missedLogs.length} missed
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2.5">
                    {missedLogs.map((log) => {
                      const med = getMedName(log.medicationId);
                      if (!med) return null;
                      
                      return (
                        <div
                          key={log.id}
                          className="flex items-center gap-3 rounded-lg border-2 border-gray-300 bg-gray-50 p-3"
                        >
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-400 text-white">
                            <X className="h-5 w-5" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{med.name}</h3>
                              <Badge variant="secondary" className="text-xs">Missed</Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {med.dosage} • Scheduled for {log.time}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
              </div>
            </div>
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
                              <div className={`text-2xl font-bold ${
                                rate >= 90 ? "text-red-600" :
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
                                    className={`flex items-center gap-3 rounded-lg border-2 p-3 ${
                                      log.status === "taken"
                                        ? "border-red-200 bg-red-50"
                                        : "border-gray-200 bg-gray-50"
                                    }`}
                                  >
                                    <div
                                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                                        log.status === "taken"
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

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog?.open || false} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.action === "taken" ? "Confirm Medication Taken" : "Mark as Missed"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.action === "taken" ? (
                <>
                  Are you sure you've taken <strong>{confirmDialog?.medicationName}</strong>? 
                  This will update your adherence record.
                </>
              ) : (
                <>
                  Mark <strong>{confirmDialog?.medicationName}</strong> as missed? 
                  This will be recorded in your history.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={confirmDialog?.action === "taken" ? "bg-red-600 hover:bg-red-700" : ""}
              onClick={() => {
                if (confirmDialog) {
                  markMedication(confirmDialog.logId, confirmDialog.action);
                }
              }}
            >
              {confirmDialog?.action === "taken" ? "Yes, I took it" : "Mark as Missed"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PatientMedications;
