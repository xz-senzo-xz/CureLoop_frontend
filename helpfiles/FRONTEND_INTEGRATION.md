# Clinical Notes API Documentation

## Overview

The backend now has **two separate API endpoints** for processing medical consultations:

1. **Speech-to-Text API** - Converts audio to text transcript
2. **Clinical Notes Extraction API** - Extracts structured clinical notes from text

This separation allows for flexible workflows where you can:
- Call both APIs in sequence (audio → transcript → clinical notes)
- Call the clinical notes API independently with any text
- Retry extraction without re-transcribing audio

---

## API Endpoints

### 1. Speech-to-Text API

**Endpoint:** `POST /api/speech/transcribe`

**Description:** Transcribes audio file to text using ElevenLabs API

**Request:**
- Content-Type: `multipart/form-data`
- Body: Audio file with key `audio`
- Supported formats: `mp3`, `wav`, `webm`, `m4a`, `ogg`, `flac`
- Max file size: 25MB

**Response:**
```json
{
  "success": true,
  "transcript": "Patient came in complaining of severe headache...",
  "timestamp": "2026-02-15T10:30:00.000Z"
}
```

**Example (cURL):**
```bash
curl -X POST http://localhost:5001/api/speech/transcribe \
  -F "audio=@consultation.mp3"
```

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('audio', audioFile);

const response = await fetch('http://localhost:5001/api/speech/transcribe', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data.transcript);
```

---

### 2. Clinical Notes Extraction API

**Endpoint:** `POST /api/clinical/extract-clinical-notes`

**Description:** Extracts structured clinical information from raw medical transcription text

**Request:**
- Content-Type: `application/json`
- Body:
```json
{
  "text": "Patient came in complaining of severe headache for the past 3 days..."
}
```

**Response:**
```json
{
  "success": true,
  "clinical_notes": {
    "chief_complaint": "Severe headache for the past 3 days",
    "history": "Patient has a history of migraines but says this one is different and more intense. No fever, no vision changes.",
    "examination": "Patient appears in mild distress, no neurological deficits noted. Blood pressure is 130/85 mmHg.",
    "diagnosis": "Tension headache possibly related to stress",
    "plan": "Prescribe ibuprofen 400mg three times daily. Recommend stress management techniques. Follow up in one week if symptoms persist.",
    "additional_observations": ""
  }
}
```

**Example (cURL):**
```bash
curl -X POST http://localhost:5001/api/clinical/extract-clinical-notes \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Patient came in complaining of severe headache for the past 3 days. Patient has a history of migraines but says this one is different and more intense."
  }'
```

**Example (JavaScript):**
```javascript
const response = await fetch('http://localhost:5001/api/clinical/extract-clinical-notes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: transcriptText
  })
});

const data = await response.json();
console.log(data.clinical_notes);
```

---

## Complete Workflow Example

### Frontend Implementation

```javascript
// Step 1: Transcribe audio
async function transcribeAudio(audioFile) {
  const formData = new FormData();
  formData.append('audio', audioFile);
  
  const response = await fetch('http://localhost:5001/api/speech/transcribe', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  return data.transcript;
}

// Step 2: Extract clinical notes
async function extractClinicalNotes(transcript) {
  const response = await fetch('http://localhost:5001/api/clinical/extract-clinical-notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: transcript
    })
  });
  
  const data = await response.json();
  return data.clinical_notes;
}

// Complete workflow
async function processConsultation(audioFile) {
  try {
    // Step 1: Get transcript
    const transcript = await transcribeAudio(audioFile);
    console.log('Transcript:', transcript);
    
    // Step 2: Extract clinical notes
    const clinicalNotes = await extractClinicalNotes(transcript);
    console.log('Clinical Notes:', clinicalNotes);
    
    // Now you have both the raw transcript and structured notes
    return {
      rawTranscript: transcript,
      structuredNotes: clinicalNotes
    };
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## Clinical Notes Structure

The extracted clinical notes contain these 6 fields:

| Field                     | Description                                   | Example                                              |
| ------------------------- | --------------------------------------------- | ---------------------------------------------------- |
| `chief_complaint`         | Main reason for patient's visit               | "Severe headache for 3 days"                         |
| `history`                 | Patient's medical history and present illness | "History of migraines, this episode is more intense" |
| `examination`             | Physical examination findings                 | "Blood pressure 130/85, no neurological deficits"    |
| `diagnosis`               | Doctor's assessment/diagnosis                 | "Tension headache related to stress"                 |
| `plan`                    | Treatment plan and recommendations            | "Ibuprofen 400mg TID, stress management"             |
| `additional_observations` | Any other relevant notes                      | "Patient reports high work stress recently"          |

---

## Error Handling

### Speech-to-Text Errors

```json
{
  "success": false,
  "error": "No audio file provided"
}
```

Common errors:
- Missing audio file
- Invalid file format
- File too large (>25MB)
- ElevenLabs API error

### Clinical Notes Extraction Errors

```json
{
  "success": false,
  "error": "Missing 'text' field in request body"
}
```

Common errors:
- Missing text field
- Empty text
- Groq API error

---

## Health Check Endpoints

### Speech-to-Text Health
```bash
GET /api/speech/health
```

### Clinical Notes Health
```bash
GET /api/clinical/health
```

---

## Environment Variables Required

```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key
GROQ_API_KEY=your_groq_api_key
```

---

## Benefits of Separate APIs

1. **Flexibility**: Extract clinical notes from any text source, not just audio
2. **Performance**: Can cache transcripts and re-extract notes if needed
3. **Testing**: Easy to test extraction logic with sample text
4. **Error Recovery**: If extraction fails, retry without re-transcribing
5. **Cost Optimization**: Only call extraction API when needed
