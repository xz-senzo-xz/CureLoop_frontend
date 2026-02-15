export type UserRole = "doctor" | "patient";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  conditions: string[];
  lastVisit: string;
  adherenceRate: number;
  status: "active" | "stable" | "attention";
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  duration: string;
  notes?: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  date: string;
  time: string;
  status: "taken" | "missed" | "upcoming";
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  medications: Medication[];
  startDate: string;
  endDate: string;
  notes: string;
}

export interface ConsultationNote {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  chiefComplaint: string;
  history: string;
  examination: string;
  diagnosis: string;
  plan: string;
  observations: string;
}

export interface CheckIn {
  id: string;
  patientId: string;
  date: string;
  mood: "great" | "good" | "okay" | "bad";
  symptoms: string[];
  notes: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  type: string;
  status: "upcoming" | "completed" | "cancelled";
}

export interface Notification {
  id: string;
  patientId: string;
  type: "medication_reminder" | "medication_missed" | "appointment_reminder" | "general";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  medicationId?: string;
  medicationLogId?: string;
  actionRequired?: boolean;
}
