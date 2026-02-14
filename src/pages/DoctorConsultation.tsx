import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { mockPatients, mockMedications } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mic, MicOff, ChevronLeft, ChevronRight, Send, Plus, Trash2, Sparkles } from "lucide-react";

const steps = ["Patient", "Transcription", "Structured Note", "Treatment Plan", "Review"];

const DoctorConsultation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
  });
  
  // Check if patientId is provided in URL params
  useEffect(() => {
    const patientId = searchParams.get("patientId");
    if (patientId) {
      setSelectedPatient(patientId);
      setIsNewPatient(false);
    }
  }, [searchParams]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [note, setNote] = useState({
    chiefComplaint: "",
    history: "",
    examination: "",
    diagnosis: "",
    plan: "",
    observations: "",
  });
  const [meds, setMeds] = useState([{ name: "", dosage: "", frequency: "", time: "", duration: "" }]);
  
  const canProceedFromStep0 = () => {
    if (isNewPatient) {
      return newPatient.name && newPatient.age && newPatient.gender && newPatient.phone;
    }
    return selectedPatient !== "";
  };

  const simulateTranscription = () => {
    setIsRecording(true);
    setTimeout(() => {
      setTranscript(
        "Patient complains of persistent headaches for the past two weeks, mainly in the morning. " +
        "No visual disturbances. Blood pressure slightly elevated at last check. " +
        "Currently on Amlodipine 5mg daily. Reports good medication compliance."
      );
      setIsRecording(false);
    }, 2000);
  };

  const generateNote = () => {
    setNote({
      chiefComplaint: "Persistent morning headaches for 2 weeks",
      history: "Patient reports headaches mainly upon waking. No visual disturbances, no nausea. BP slightly elevated at last check.",
      examination: "BP: 140/90 mmHg. Neurological exam normal. Fundoscopy: no papilledema.",
      diagnosis: "Tension-type headache, possibly related to suboptimal BP control.",
      plan: "Adjust antihypertensive. Add BP monitoring diary. Follow up in 2 weeks.",
      observations: "",
    });
  };

  const addMed = () => setMeds([...meds, { name: "", dosage: "", frequency: "", time: "", duration: "" }]);
  const removeMed = (i: number) => setMeds(meds.filter((_, idx) => idx !== i));
  const updateMed = (i: number, field: string, value: string) =>
    setMeds(meds.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));

  return (
    <div className="h-full bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <button 
          onClick={() => navigate("/doctor/patients")} 
          className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Patients
        </button>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">New Consultation</h1>
          <p className="text-gray-600">Create a new patient consultation record</p>
        </div>

        {/* Steps indicator */}
        <div className="mb-8">
          <div className="flex gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex-1">
                <div className={`h-1.5 rounded-full transition-all ${
                  i <= step ? "bg-red-600" : "bg-gray-200"
                }`} />
                <p className={`mt-2 text-xs font-medium ${
                  i <= step ? "text-red-600" : "text-gray-500"
                }`}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 0: Select Patient */}
        {step === 0 && (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-gray-900">Patient Information</CardTitle>
                  <CardDescription>
                    {isNewPatient ? "Create a new patient" : "Select an existing patient"}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsNewPatient(!isNewPatient);
                    setSelectedPatient("");
                    setNewPatient({ name: "", age: "", gender: "", phone: "" });
                  }}
                >
                  {isNewPatient ? "Select Existing" : "New Patient"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isNewPatient ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Full Name *</Label>
                    <Input
                      placeholder="Enter patient's full name"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                      className="border-gray-200 focus:border-red-600 focus:ring-red-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Age *</Label>
                      <Input
                        type="number"
                        placeholder="Age"
                        value={newPatient.age}
                        onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                        className="border-gray-200 focus:border-red-600 focus:ring-red-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Gender *</Label>
                      <select
                        value={newPatient.gender}
                        onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Phone Number *</Label>
                    <Input
                      placeholder="+212 6 12 34 56 78"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                      className="border-gray-200 focus:border-red-600 focus:ring-red-600"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {mockPatients.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPatient(p.id)}
                      className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-all ${
                        selectedPatient === p.id 
                          ? "border-red-600 bg-red-50" 
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        selectedPatient === p.id 
                          ? "bg-red-600 text-white" 
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {p.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{p.name}</p>
                        <p className="text-sm text-gray-600">{p.age}y · {p.conditions.join(", ")}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 1: Transcription */}
        {step === 1 && (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Speech-to-Text</CardTitle>
              <CardDescription>Record or transcribe the consultation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <button
                  onClick={simulateTranscription}
                  className={`flex h-20 w-20 items-center justify-center rounded-full transition-all ${
                    isRecording 
                      ? "bg-red-600 text-white animate-pulse" 
                      : "bg-red-100 text-red-600 hover:bg-red-200"
                  }`}
                >
                  {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                </button>
              </div>
              <p className="text-center text-sm text-gray-600">
                {isRecording ? "Listening... (simulated)" : "Tap to start recording"}
              </p>
              <Textarea
                placeholder="Transcription will appear here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="min-h-[200px] border-gray-200 focus:border-red-600 focus:ring-red-600"
              />
            </CardContent>
          </Card>
        )}

        {/* Step 2: Structured Note */}
        {step === 2 && (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg text-gray-900">Clinical Note</CardTitle>
                <CardDescription>Structured clinical documentation</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={generateNote} className="gap-2">
                <Sparkles className="h-4 w-4" /> Auto-generate
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {([
                ["chiefComplaint", "Chief Complaint"],
                ["history", "History"],
                ["examination", "Examination"],
                ["diagnosis", "Diagnosis"],
                ["plan", "Plan"],
                ["observations", "Additional Observations"],
              ] as const).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">{label}</Label>
                  <Textarea
                    value={note[key]}
                    onChange={(e) => setNote({ ...note, [key]: e.target.value })}
                    className="min-h-[80px] border-gray-200 focus:border-red-600 focus:ring-red-600"
                    placeholder={`Enter ${label.toLowerCase()}...`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Treatment Plan */}
        {step === 3 && (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg text-gray-900">Treatment Plan</CardTitle>
                <CardDescription>Prescribe medications and treatment</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={addMed} className="gap-2">
                <Plus className="h-4 w-4" /> Add Medication
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {meds.map((med, i) => (
                <div key={i} className="space-y-3 rounded-lg border-2 border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">Medication {i + 1}</span>
                    {meds.length > 1 && (
                      <button 
                        onClick={() => removeMed(i)} 
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Input 
                        placeholder="Medication name" 
                        value={med.name} 
                        onChange={(e) => updateMed(i, "name", e.target.value)}
                        className="border-gray-200 focus:border-red-600 focus:ring-red-600"
                      />
                    </div>
                    <Input 
                      placeholder="Dosage" 
                      value={med.dosage} 
                      onChange={(e) => updateMed(i, "dosage", e.target.value)}
                      className="border-gray-200 focus:border-red-600 focus:ring-red-600"
                    />
                    <Input 
                      placeholder="Frequency" 
                      value={med.frequency} 
                      onChange={(e) => updateMed(i, "frequency", e.target.value)}
                      className="border-gray-200 focus:border-red-600 focus:ring-red-600"
                    />
                    <Input 
                      placeholder="Time (e.g. 08:00)" 
                      value={med.time} 
                      onChange={(e) => updateMed(i, "time", e.target.value)}
                      className="border-gray-200 focus:border-red-600 focus:ring-red-600"
                    />
                    <Input 
                      placeholder="Duration" 
                      value={med.duration} 
                      onChange={(e) => updateMed(i, "duration", e.target.value)}
                      className="border-gray-200 focus:border-red-600 focus:ring-red-600"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Review & Send</CardTitle>
              <CardDescription>Review all information before finalizing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-700">Patient</p>
                <div className="text-sm text-gray-900 mt-1">
                  {isNewPatient ? (
                    <div>
                      <p className="font-medium">{newPatient.name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {newPatient.age}y · {newPatient.gender} · {newPatient.phone}
                      </p>
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        New Patient
                      </span>
                    </div>
                  ) : (
                    <p>{mockPatients.find((p) => p.id === selectedPatient)?.name || "Not selected"}</p>
                  )}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-700">Diagnosis</p>
                <p className="text-sm text-gray-900 mt-1">{note.diagnosis || "—"}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-700">Medications</p>
                <div className="mt-1 space-y-1">
                  {meds.filter((m) => m.name).map((m, i) => (
                    <p key={i} className="text-sm text-gray-900">
                      {m.name} {m.dosage} — {m.frequency}
                    </p>
                  ))}
                  {!meds.some((m) => m.name) && <p className="text-sm text-gray-500">—</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <Button 
              variant="outline" 
              className="flex-1 border-gray-200" 
              onClick={() => setStep(step - 1)}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={() => setStep(step + 1)}
              disabled={step === 0 && !canProceedFromStep0()}
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700" 
              onClick={() => navigate("/doctor/patients")}
            >
              <Send className="mr-2 h-4 w-4" /> Validate & Send
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorConsultation;
