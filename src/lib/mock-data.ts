import {
  Patient, Medication, MedicationLog, TreatmentPlan,
  ConsultationNote, CheckIn, Appointment, User,
} from "./types";

export const mockUsers: User[] = [
  { id: "doc-1", name: "Dr. Amina Khadir", email: "amina@medcopilot.ma", role: "doctor" },
  { id: "pat-1", name: "Youssef Bennani", email: "youssef@email.com", role: "patient" },
];

export const mockPatients: Patient[] = [
  {
    id: "pat-1", vitalId: "VTL-2024-001", name: "Youssef Bennani", age: 45, gender: "Male",
    phone: "+212 6 12 34 56 78", conditions: ["Hypertension", "Type 2 Diabetes"],
    lastVisit: "2026-02-10", adherenceRate: 82, status: "active",
  },
  {
    id: "pat-2", vitalId: "VTL-2024-002", name: "Fatima Zahra El Idrissi", age: 34, gender: "Female",
    phone: "+212 6 98 76 54 32", conditions: ["Asthma"],
    lastVisit: "2026-02-12", adherenceRate: 95, status: "stable",
  },
  {
    id: "pat-3", vitalId: "VTL-2024-003", name: "Karim Tazi", age: 58, gender: "Male",
    phone: "+212 6 55 44 33 22", conditions: ["Coronary Artery Disease", "Hyperlipidemia"],
    lastVisit: "2026-02-08", adherenceRate: 61, status: "attention",
  },
  {
    id: "pat-4", vitalId: "VTL-2024-004", name: "Nadia Ouazzani", age: 28, gender: "Female",
    phone: "+212 6 11 22 33 44", conditions: ["Iron Deficiency Anemia"],
    lastVisit: "2026-02-13", adherenceRate: 90, status: "stable",
  },
];

export const mockMedications: Medication[] = [
  { id: "med-1", name: "Amlodipine", dosage: "5mg", frequency: "Once daily", time: "08:00", duration: "3 months", notes: "Take with water" },
  { id: "med-2", name: "Metformin", dosage: "500mg", frequency: "Twice daily", time: "08:00", duration: "6 months", notes: "Take with meals" },
  { id: "med-3", name: "Metformin", dosage: "500mg", frequency: "Twice daily", time: "20:00", duration: "6 months", notes: "Take with dinner" },
  { id: "med-4", name: "Aspirin", dosage: "100mg", frequency: "Once daily", time: "12:00", duration: "Ongoing" },
];

// Generate medication logs for the past 30 days
export const mockMedicationLogs: MedicationLog[] = (() => {
  const logs: MedicationLog[] = [];
  const today = new Date("2026-02-14");
  
  // Generate logs for past 30 days
  for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split('T')[0];
    
    // For each medication
    mockMedications.forEach((med) => {
      const hour = parseInt(med.time.split(':')[0]);
      const minute = parseInt(med.time.split(':')[1]);
      
      let status: "taken" | "missed" | "upcoming";
      
      if (daysAgo === 0) {
        // Today - check if time has passed
        const medTime = new Date(today);
        medTime.setHours(hour, minute, 0, 0);
        status = medTime > today ? "upcoming" : (Math.random() > 0.1 ? "taken" : "upcoming");
      } else {
        // Past days - random but mostly taken (85% adherence)
        status = Math.random() > 0.15 ? "taken" : "missed";
      }
      
      logs.push({
        id: `log-${med.id}-${dateStr}`,
        medicationId: med.id,
        date: dateStr,
        time: med.time,
        status,
      });
    });
  }
  
  return logs;
})();

export const mockTreatmentPlans: TreatmentPlan[] = [
  {
    id: "tp-1", patientId: "pat-1", doctorId: "doc-1",
    diagnosis: "Hypertension & Type 2 Diabetes",
    medications: [mockMedications[0], mockMedications[1], mockMedications[2], mockMedications[3]],
    startDate: "2026-01-15", endDate: "2026-07-15",
    notes: "Monitor blood pressure weekly. HbA1c recheck in 3 months.",
  },
];

export const mockConsultationNotes: ConsultationNote[] = [
  {
    id: "cn-1", patientId: "pat-1", doctorId: "doc-1", date: "2026-02-10",
    chiefComplaint: "Routine follow-up for hypertension and diabetes management",
    history: "Patient reports occasional dizziness in the morning. Blood sugar readings have been mostly within target range.",
    examination: "BP: 135/85 mmHg. Heart rate: 72 bpm. Weight: 82 kg. No edema.",
    diagnosis: "Essential hypertension — controlled. Type 2 DM — fair control.",
    plan: "Continue current medications. Add morning blood pressure monitoring. Follow up in 4 weeks.",
    observations: "Patient appears compliant but reports forgetting evening Metformin dose occasionally.",
  },
];

// Generate check-ins for the past 30 days
export const mockCheckIns: CheckIn[] = (() => {
  const checkIns: CheckIn[] = [];
  const today = new Date("2026-02-14");
  const moods: ("great" | "good" | "okay" | "bad")[] = ["great", "good", "okay", "bad"];
  const possibleSymptoms = ["Mild headache", "Fatigue", "Dizziness", "Nausea"];
  
  for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split('T')[0];
    
    // 80% chance of having a check-in
    if (Math.random() > 0.2) {
      const mood = moods[Math.floor(Math.random() * moods.length)];
      const symptoms: string[] = [];
      
      // If mood is okay or bad, might have symptoms
      if ((mood === "okay" || mood === "bad") && Math.random() > 0.5) {
        const numSymptoms = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numSymptoms; i++) {
          const symptom = possibleSymptoms[Math.floor(Math.random() * possibleSymptoms.length)];
          if (!symptoms.includes(symptom)) symptoms.push(symptom);
        }
      }
      
      checkIns.push({
        id: `ci-${dateStr}`,
        patientId: "pat-1",
        date: dateStr,
        mood,
        symptoms,
        notes: daysAgo === 0 ? "Feeling well today" : "",
      });
    }
  }
  
  return checkIns;
})();

export const mockAppointments: Appointment[] = [
  { id: "apt-1", patientId: "pat-1", doctorId: "doc-1", date: "2026-03-10", time: "10:00", type: "Follow-up", status: "upcoming" },
  { id: "apt-2", patientId: "pat-2", doctorId: "doc-1", date: "2026-02-28", time: "14:30", type: "Check-up", status: "upcoming" },
];

// Generate weekly adherence data for the current week
export const weeklyAdherenceData = (() => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date("2026-02-14"); // Friday
  const currentDayIndex = (today.getDay() + 6) % 7; // Convert to Mon=0 format
  
  return days.map((day, index) => {
    if (index > currentDayIndex) {
      // Future days
      return { day, rate: 0 };
    }
    
    // Calculate adherence for this day
    const daysAgo = currentDayIndex - index;
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayLogs = mockMedicationLogs.filter(l => l.date === dateStr && l.status !== "upcoming");
    const taken = dayLogs.filter(l => l.status === "taken").length;
    const rate = dayLogs.length > 0 ? Math.round((taken / dayLogs.length) * 100) : 0;
    
    return { day, rate };
  });
})();
