import React, { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { mockMedicationLogs } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, Activity, Award, Calendar
} from "lucide-react";
import { format, subDays } from "date-fns";

const PatientDashboard = () => {
  const { user } = useAuth();
  
  const today = new Date("2026-02-14");
  const todayStr = format(today, "yyyy-MM-dd");

  // Calculate adherence metrics
  const adherenceMetrics = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(today, i), "yyyy-MM-dd"));
    const last30Days = Array.from({ length: 30 }, (_, i) => format(subDays(today, i), "yyyy-MM-dd"));

    const calculate = (dates: string[]) => {
      const relevantLogs = mockMedicationLogs.filter(l => dates.includes(l.date) && l.status !== "upcoming");
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
  }, [today, todayStr]);

  // Streak calculation
  const currentStreak = useMemo(() => {
    let streak = 0;
    for (let i = 1; i < 30; i++) {
      const date = format(subDays(today, i), "yyyy-MM-dd");
      const dayLogs = mockMedicationLogs.filter(l => l.date === date && l.status !== "upcoming");
      const dayRate = dayLogs.length > 0 
        ? (dayLogs.filter(l => l.status === "taken").length / dayLogs.length) * 100 
        : 0;
      
      if (dayRate >= 75) streak++;
      else break;
    }
    return streak;
  }, [today]);

  // 30-day progress data
  const progressData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = format(subDays(today, 29 - i), "yyyy-MM-dd");
      const dayLogs = mockMedicationLogs.filter(l => l.date === date && l.status !== "upcoming");
      const taken = dayLogs.filter(l => l.status === "taken").length;
      const rate = dayLogs.length > 0 ? Math.round((taken / dayLogs.length) * 100) : 0;
      return { date, rate };
    });
  }, [today]);

  return (
    <div className="h-full bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-gray-500">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},
          </p>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">{user?.name || "Patient"}</h1>
          <p className="text-gray-600">Here's your medication adherence overview</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* 30-Day Progress */}
          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">30-Day Progress</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {adherenceMetrics.month.rate}%
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {adherenceMetrics.month.taken} of {adherenceMetrics.month.total} doses
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
                  <Calendar className="h-7 w-7 text-purple-600" />
                </div>
              </div>
              
              {/* Mini progress bar */}
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-purple-600 transition-all"
                  style={{ width: `${adherenceMetrics.month.rate}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Today's Adherence */}
          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Adherence</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {adherenceMetrics.today.rate}%
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {adherenceMetrics.today.taken} of {adherenceMetrics.today.total} doses
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                  <Activity className="h-7 w-7 text-red-600" />
                </div>
              </div>
              
              {/* Mini progress bar */}
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full transition-all ${
                    adherenceMetrics.today.rate >= 90
                      ? "bg-red-600"
                      : adherenceMetrics.today.rate >= 60
                      ? "bg-orange-500"
                      : "bg-gray-400"
                  }`}
                  style={{ width: `${adherenceMetrics.today.rate}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Weekly Average */}
          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Weekly Average</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {adherenceMetrics.week.rate}%
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {adherenceMetrics.week.taken} of {adherenceMetrics.week.total} doses
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                  <TrendingUp className="h-7 w-7 text-blue-600" />
                </div>
              </div>
              
              {/* Mini progress bar */}
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${adherenceMetrics.week.rate}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Current Streak */}
          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Streak</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {currentStreak}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {currentStreak === 1 ? "day" : "days"} above 75%
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                  <Award className="h-7 w-7 text-amber-600" />
                </div>
              </div>
              
              {/* Streak indicator */}
              <div className="mt-4 flex items-center gap-1">
                {Array.from({ length: Math.min(currentStreak, 7) }).map((_, i) => (
                  <div
                    key={i}
                    className="h-2 flex-1 rounded-full bg-amber-600"
                  />
                ))}
                {currentStreak < 7 &&
                  Array.from({ length: 7 - currentStreak }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="h-2 flex-1 rounded-full bg-gray-200"
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 30-Day Visual Progress */}
        <Card className="mt-6 border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">30-Day Progress</h3>
            <div className="flex items-end justify-between gap-1 h-32">
              {progressData.map((day, index) => (
                <div
                  key={index}
                  className="group relative flex flex-1 flex-col items-center justify-end"
                >
                  <div
                    className={`w-full rounded-t transition-all hover:opacity-80 ${
                      day.rate >= 90
                        ? "bg-red-600"
                        : day.rate >= 60
                        ? "bg-orange-500"
                        : day.rate > 0
                        ? "bg-gray-400"
                        : "bg-gray-200"
                    }`}
                    style={{ height: `${Math.max(day.rate, 5)}%` }}
                  />
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg">
                    {format(new Date(day.date), "MMM d")}: {day.rate}%
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <span>{format(subDays(today, 29), "MMM d")}</span>
              <span>Today ({format(today, "MMM d")})</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;
