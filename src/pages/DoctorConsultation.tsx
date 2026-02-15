import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { mockPatients, mockMedications } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Mic, MicOff, ChevronLeft, ChevronRight, Send, Plus, Trash2, Sparkles, Search,
  User, FileText, Pill, CheckCircle2, ArrowLeft, Circle, CheckCircle
} from "lucide-react";

const steps = [
  { id: 0, name: "Patient", icon: User },
  { id: 1, name: "Transcription", icon: Mic },
  { id: 2, name: "Clinical Note", icon: FileText },
  { id: 3, name: "Treatment", icon: Pill },
  { id: 4, name: "Review", icon: CheckCircle2 },
];

const DoctorConsultation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [searchMode, setSearchMode] = useState<"list" | "vitalId">("list");
  const [vitalIdSearch, setVitalIdSearch] = useState("");
  const [vitalIdSearchResult, setVitalIdSearchResult] = useState<{ found: boolean; patient?: typeof mockPatients[0] } | null>(null);
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    vitalId: "",
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
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingError, setRecordingError] = useState("");
  const [note, setNote] = useState({
    chiefComplaint: "",
    history: "",
    examination: "",
    diagnosis: "",
    plan: "",
    observations: "",
  });
  const [meds, setMeds] = useState([{ name: "", dosage: "", frequency: "", time: "", duration: "" }]);

  const handleVitalIdSearch = () => {
    if (!vitalIdSearch.trim()) {
      setVitalIdSearchResult(null);
      return;
    }

    const foundPatient = mockPatients.find(p =>
      p.vitalId.toLowerCase() === vitalIdSearch.trim().toLowerCase()
    );

    if (foundPatient) {
      setVitalIdSearchResult({ found: true, patient: foundPatient });
      setSelectedPatient(foundPatient.id);
      setIsNewPatient(false);
    } else {
      setVitalIdSearchResult({ found: false });
      setNewPatient(prev => ({ ...prev, vitalId: vitalIdSearch.trim() }));
      setIsNewPatient(true);
    }
  };

  const canProceedFromStep0 = () => {
    if (isNewPatient) {
      return newPatient.name && newPatient.age && newPatient.gender && newPatient.phone && newPatient.vitalId;
    }
    return selectedPatient !== "";
  };

  const canNavigateToStep = (targetStep: number) => {
    if (targetStep === 0) return true;
    if (targetStep === 1) return canProceedFromStep0();
    if (targetStep === 2) return transcript.trim() !== "";
    if (targetStep === 3) return note.diagnosis.trim() !== "";
    if (targetStep === 4) return true;
    return false;
  };

  // Audio Recording Functions
  const startRecording = async () => {
    try {
      setRecordingError("");

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create MediaRecorder instance
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      const chunks: Blob[] = [];

      // Collect audio data
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      // Start recording
      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);

    } catch (error) {
      console.error("Error starting recording:", error);
      setRecordingError("Failed to access microphone. Please check permissions.");
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorder) return;

    return new Promise<void>((resolve) => {
      mediaRecorder.onstop = async () => {
        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach(track => track.stop());

        // Create audio blob
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

        // Send to backend for transcription
        await transcribeAudio(audioBlob);

        // Reset recording state
        setMediaRecorder(null);
        setAudioChunks([]);
        resolve();
      };

      mediaRecorder.stop();
      setIsRecording(false);
    });
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true);
      setRecordingError("");

      // Create FormData
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      // Send to backend
      const response = await fetch('http://localhost:5001/api/speech/transcribe', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      console.log(result)
      if (result.success) {
        // Update transcript
        setTranscript(result.transcript);
      } else {
        setRecordingError(result.error || "Transcription failed. Please try again.");
      }

    } catch (error) {
      console.error("Error transcribing audio:", error);
      setRecordingError("Failed to transcribe audio. Please check backend connection.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [generateNoteError, setGenerateNoteError] = useState("");
  const [isEditingHistory, setIsEditingHistory] = useState(false);

  const generateNote = async () => {
    if (!transcript.trim()) {
      setGenerateNoteError("No transcript available. Please complete the transcription step first.");
      return;
    }

    try {
      setIsGeneratingNote(true);
      setGenerateNoteError("");

      // Call the clinical notes extraction API
      const response = await fetch('http://localhost:5001/api/clinical/extract-clinical-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: transcript
        })
      });

      const result = await response.json();

      console.log(result)

      if (result.success && result.clinical_notes) {
        // Map the API response to the note state
        setNote({
          chiefComplaint: result.clinical_notes.chief_complaint || "",
          history: result.clinical_notes.history || "",
          examination: result.clinical_notes.examination || "",
          diagnosis: result.clinical_notes.diagnosis || "",
          plan: result.clinical_notes.plan || "",
          observations: result.clinical_notes.additional_observations || "",
        });
      } else {
        setGenerateNoteError(result.error || "Failed to generate clinical notes. Please try again.");
      }

    } catch (error) {
      console.error("Error generating clinical notes:", error);
      setGenerateNoteError("Failed to generate clinical notes. Please check backend connection.");
    } finally {
      setIsGeneratingNote(false);
    }
  };

  const addMed = () => setMeds([...meds, { name: "", dosage: "", frequency: "", time: "", duration: "" }]);
  const removeMed = (i: number) => setMeds(meds.filter((_, idx) => idx !== i));
  const updateMed = (i: number, field: string, value: string) =>
    setMeds(meds.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < step) return "completed";
    if (stepIndex === step) return "current";
    return "upcoming";
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="w-72 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={() => navigate("/doctor/patients")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Patients
          </button>
          <h1 className="text-xl font-bold text-gray-900">New Consultation</h1>
          <p className="text-sm text-gray-500 mt-1">Step {step + 1} of {steps.length}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {steps.map((stepItem) => {
            const status = getStepStatus(stepItem.id);
            const Icon = stepItem.icon;
            const isClickable = canNavigateToStep(stepItem.id) || stepItem.id <= step;

            return (
              <button
                key={stepItem.id}
                onClick={() => {
                  if (isClickable) {
                    setStep(stepItem.id);
                  }
                }}
                disabled={!isClickable}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${status === "current"
                  ? "bg-red-50 border-2 border-red-600 text-red-700"
                  : status === "completed"
                    ? "bg-green-50 border-2 border-green-200 text-green-700 hover:bg-green-100"
                    : isClickable
                      ? "border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                      : "border-2 border-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
              >
                <div className={`flex-shrink-0 ${status === "current" ? "text-red-600" :
                  status === "completed" ? "text-green-600" :
                    "text-gray-400"
                  }`}>
                  {status === "completed" ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${status === "current" ? "text-red-900" :
                    status === "completed" ? "text-green-900" :
                      "text-gray-600"
                    }`}>
                    {stepItem.name}
                  </div>
                  {status === "completed" && (
                    <div className="text-xs text-green-600 mt-0.5">Completed</div>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Progress</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Step 0: Select Patient */}
          {step === 0 && (
            <div className="space-y-6 transition-all duration-300">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Information</h2>
                <p className="text-gray-600">
                  {searchMode === "vitalId"
                    ? "Search patient by Vital ID"
                    : isNewPatient
                      ? "Create a new patient"
                      : "Select an existing patient"}
                </p>
              </div>

              <div className="flex gap-3 mb-6">
                <Button
                  variant={searchMode === "vitalId" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSearchMode("vitalId");
                    setSelectedPatient("");
                    setVitalIdSearch("");
                    setVitalIdSearchResult(null);
                    setIsNewPatient(false);
                  }}
                  className={searchMode === "vitalId" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  <Search className="mr-2 h-4 w-4" /> Search by Vital ID
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchMode("list");
                    setIsNewPatient(!isNewPatient);
                    setSelectedPatient("");
                    setVitalIdSearch("");
                    setVitalIdSearchResult(null);
                    setNewPatient({ name: "", age: "", gender: "", phone: "", vitalId: "" });
                  }}
                >
                  {isNewPatient ? "Select Existing" : "New Patient"}
                </Button>
              </div>

              <Card className="border-gray-200 shadow-md">
                <CardContent className="p-6">
                  {searchMode === "vitalId" ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Vital ID *</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter patient's Vital ID (e.g., VTL-2024-001)"
                            value={vitalIdSearch}
                            onChange={(e) => {
                              setVitalIdSearch(e.target.value);
                              setVitalIdSearchResult(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleVitalIdSearch();
                              }
                            }}
                            className="border-gray-200 focus:border-red-600 focus:ring-red-600"
                          />
                          <Button
                            onClick={handleVitalIdSearch}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          The Vital ID is a unique identifier given to patients using the app.
                          It allows any doctor to access the patient's medical record.
                        </p>
                      </div>

                      {vitalIdSearchResult && (
                        <div className={`rounded-lg border-2 p-4 transition-all ${vitalIdSearchResult.found
                          ? "border-green-300 bg-green-50"
                          : "border-orange-300 bg-orange-50"
                          }`}>
                          {vitalIdSearchResult.found ? (
                            <div>
                              <p className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" /> Patient found
                              </p>
                              <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-lg font-bold text-white">
                                  {vitalIdSearchResult.patient!.name.split(" ").map((n) => n[0]).join("")}
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900 text-lg">{vitalIdSearchResult.patient!.name}</p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {vitalIdSearchResult.patient!.age}y · {vitalIdSearchResult.patient!.conditions.join(", ")}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Vital ID: {vitalIdSearchResult.patient!.vitalId}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm font-semibold text-orange-800 mb-2">
                                Patient not found with Vital ID: {vitalIdSearch}
                              </p>
                              <p className="text-sm text-gray-700 mb-4">
                                This appears to be a new patient. Please fill in their information below to add them to the system.
                              </p>
                              <div className="space-y-4 mt-4 bg-white p-4 rounded-lg border border-gray-200">
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
                                <div className="space-y-2">
                                  <Label className="text-sm font-semibold text-gray-700">Vital ID *</Label>
                                  <Input
                                    value={newPatient.vitalId}
                                    disabled
                                    className="border-gray-200 bg-gray-50"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : isNewPatient ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Vital ID *</Label>
                        <Input
                          placeholder="Enter patient's Vital ID (e.g., VTL-2024-001)"
                          value={newPatient.vitalId}
                          onChange={(e) => setNewPatient({ ...newPatient, vitalId: e.target.value })}
                          className="border-gray-200 focus:border-red-600 focus:ring-red-600"
                        />
                        <p className="text-xs text-gray-500">
                          The Vital ID is a unique identifier given to patients using the app.
                        </p>
                      </div>
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
                    <div className="grid grid-cols-1 gap-3">
                      {mockPatients.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPatient(p.id)}
                          className={`flex items-center gap-4 rounded-lg border-2 p-4 text-left transition-all ${selectedPatient === p.id
                            ? "border-red-600 bg-red-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            }`}
                        >
                          <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all ${selectedPatient === p.id
                            ? "bg-red-600 text-white scale-110"
                            : "bg-gray-100 text-gray-600"
                            }`}>
                            {p.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{p.name}</p>
                            <p className="text-sm text-gray-600">{p.age}y · {p.conditions.join(", ")}</p>
                            <p className="text-xs text-gray-500 mt-1">Vital ID: {p.vitalId}</p>
                          </div>
                          {selectedPatient === p.id && (
                            <CheckCircle className="h-5 w-5 text-red-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 1: Transcription */}
          {step === 1 && (
            <div className="space-y-6 transition-all duration-300">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Speech-to-Text Transcription</h2>
                <p className="text-gray-600">Record the consultation or manually enter notes</p>
              </div>

              <Card className="border-gray-200 shadow-md">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center space-y-6">
                    <button
                      onClick={toggleRecording}
                      disabled={isTranscribing}
                      className={`flex h-24 w-24 items-center justify-center rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${isRecording
                        ? "bg-red-600 text-white animate-pulse shadow-lg"
                        : isTranscribing
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-red-100 text-red-600 hover:bg-red-200 shadow-md"
                        }`}
                    >
                      {isRecording ? (
                        <MicOff className="h-10 w-10" />
                      ) : (
                        <Mic className="h-10 w-10" />
                      )}
                    </button>

                    <p className="text-center text-sm font-medium text-gray-700">
                      {isRecording
                        ? "Recording... Click to stop"
                        : isTranscribing
                          ? "Transcribing audio..."
                          : "Click to start recording"}
                    </p>

                    {recordingError && (
                      <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{recordingError}</p>
                      </div>
                    )}

                    <div className="w-full">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Consultation Transcript
                      </Label>
                      <Textarea
                        placeholder="Transcription will appear here, or type directly..."
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        disabled={isRecording || isTranscribing}
                        className="min-h-[300px] border-gray-200 focus:border-red-600 focus:ring-red-600 text-sm disabled:opacity-70"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        {transcript.length > 0
                          ? `${transcript.length} characters`
                          : "Press the microphone button to start recording"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Structured Note */}
          {step === 2 && (
            <div className="space-y-6 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Clinical Note</h2>
                  <p className="text-gray-600">Structured clinical documentation</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={generateNote}
                  disabled={isGeneratingNote || !transcript.trim()}
                  className="gap-2"
                >
                  <Sparkles className={`h-4 w-4 ${isGeneratingNote ? 'animate-spin' : ''}`} />
                  {isGeneratingNote ? 'Generating...' : 'Auto-generate'}
                </Button>
              </div>

              {generateNoteError && (
                <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{generateNoteError}</p>
                </div>
              )}

              <Card className="border-gray-200 shadow-md">
                <CardContent className="p-6 space-y-5">
                  {/* Chief Complaint */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Chief Complaint</Label>
                    <Textarea
                      value={note.chiefComplaint}
                      onChange={(e) => setNote({ ...note, chiefComplaint: e.target.value })}
                      className="min-h-[100px] border-gray-200 focus:border-red-600 focus:ring-red-600"
                      placeholder="Enter chief complaint..."
                    />
                  </div>

                  {/* History - Special formatted display */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-gray-700">History</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditingHistory(!isEditingHistory)}
                        className="text-xs h-7"
                      >
                        {isEditingHistory ? "Save" : "Edit"}
                      </Button>
                    </div>

                    {isEditingHistory ? (
                      // Edit Mode - Show textarea
                      <Textarea
                        value={note.history}
                        onChange={(e) => setNote({ ...note, history: e.target.value })}
                        className="min-h-[300px] border-2 border-red-600 focus:border-red-600 focus:ring-red-600 font-mono text-sm"
                        placeholder="Enter patient history...&#10;&#10;Format:&#10;**Section Name:**&#10;• Bullet point 1&#10;• Bullet point 2"
                        autoFocus
                      />
                    ) : (
                      // View Mode - Show formatted content
                      <div className="border-2 border-gray-200 rounded-md p-4 bg-white min-h-[300px] overflow-y-auto">
                        {note.history ? (
                          <div className="prose prose-sm max-w-none">
                            {note.history.split('\n').map((line, idx) => {
                              // Check if line is a header (starts with ** and ends with **)
                              if (line.trim().match(/^\*\*(.+?)\*\*:?$/)) {
                                const headerText = line.trim().replace(/^\*\*/, '').replace(/\*\*:?$/, '');
                                return (
                                  <h3 key={idx} className="text-base font-bold text-red-700 mt-4 mb-2 first:mt-0">
                                    {headerText}
                                  </h3>
                                );
                              }
                              // Check if line is a bullet point
                              else if (line.trim().startsWith('•')) {
                                return (
                                  <div key={idx} className="flex items-start gap-2 ml-2 my-1.5">
                                    <span className="text-red-600 font-bold mt-0.5">•</span>
                                    <span className="text-gray-700 text-sm flex-1 leading-relaxed">{line.trim().substring(1).trim()}</span>
                                  </div>
                                );
                              }
                              // Regular line
                              else if (line.trim()) {
                                return (
                                  <p key={idx} className="text-gray-700 text-sm my-1.5 leading-relaxed">
                                    {line}
                                  </p>
                                );
                              }
                              // Empty line
                              return <div key={idx} className="h-3" />;
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm italic">No history entered. Click "Edit" to add patient history.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Examination */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Examination</Label>
                    <Textarea
                      value={note.examination}
                      onChange={(e) => setNote({ ...note, examination: e.target.value })}
                      className="min-h-[150px] border-gray-200 focus:border-red-600 focus:ring-red-600"
                      placeholder="Enter examination findings..."
                    />
                  </div>

                  {/* Diagnosis */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Diagnosis</Label>
                    <Textarea
                      value={note.diagnosis}
                      onChange={(e) => setNote({ ...note, diagnosis: e.target.value })}
                      className="min-h-[100px] border-gray-200 focus:border-red-600 focus:ring-red-600"
                      placeholder="Enter diagnosis..."
                    />
                  </div>

                  {/* Plan */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Plan</Label>
                    <Textarea
                      value={note.plan}
                      onChange={(e) => setNote({ ...note, plan: e.target.value })}
                      className="min-h-[150px] border-gray-200 focus:border-red-600 focus:ring-red-600"
                      placeholder="Enter treatment plan..."
                    />
                  </div>

                  {/* Additional Observations */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Additional Observations</Label>
                    <Textarea
                      value={note.observations}
                      onChange={(e) => setNote({ ...note, observations: e.target.value })}
                      className="min-h-[100px] border-gray-200 focus:border-red-600 focus:ring-red-600"
                      placeholder="Enter additional observations..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Treatment Plan */}
          {step === 3 && (
            <div className="space-y-6 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Treatment Plan</h2>
                  <p className="text-gray-600">Prescribe medications and treatment</p>
                </div>
                <Button size="sm" variant="outline" onClick={addMed} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Medication
                </Button>
              </div>

              <div className="space-y-4">
                {meds.map((med, i) => (
                  <Card key={i} className="border-gray-200 shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-gray-900">Medication {i + 1}</span>
                        {meds.length > 1 && (
                          <button
                            onClick={() => removeMed(i)}
                            className="text-red-600 hover:text-red-700 transition-colors p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6 transition-all duration-300">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Finalize</h2>
                <p className="text-gray-600">Review all information before finalizing the consultation</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Card className="border-gray-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isNewPatient ? (
                      <div>
                        <p className="font-medium text-gray-900 text-lg">{newPatient.name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {newPatient.age}y · {newPatient.gender} · {newPatient.phone}
                        </p>
                        {newPatient.vitalId && (
                          <p className="text-xs text-gray-500 mt-1">Vital ID: {newPatient.vitalId}</p>
                        )}
                        <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                          New Patient
                        </span>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-gray-900 text-lg">
                          {mockPatients.find((p) => p.id === selectedPatient)?.name || "Not selected"}
                        </p>
                        {selectedPatient && mockPatients.find((p) => p.id === selectedPatient)?.vitalId && (
                          <p className="text-xs text-gray-500 mt-1">
                            Vital ID: {mockPatients.find((p) => p.id === selectedPatient)?.vitalId}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Diagnosis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-900">{note.diagnosis || "—"}</p>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Medications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {meds.filter((m) => m.name).map((m, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <Pill className="h-4 w-4 text-red-600" />
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{m.name}</span> {m.dosage} — {m.frequency}
                            {m.time && ` at ${m.time}`}
                            {m.duration && ` (${m.duration})`}
                          </p>
                        </div>
                      ))}
                      {!meds.some((m) => m.name) && <p className="text-sm text-gray-500">No medications prescribed</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Navigation Footer */}
          <div className="mt-8 flex gap-3 pt-6 border-t border-gray-200">
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
                <Send className="mr-2 h-4 w-4" /> Complete Consultation
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorConsultation;
