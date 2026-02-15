# Medical Consultation Platform

A modern healthcare application designed to streamline clinical documentation through AI-powered speech-to-text transcription and automated clinical note extraction. Built for both doctors and patients, this platform enhances the consultation experience by reducing administrative overhead and improving record accuracy.

## Features

- **AI-Powered Transcription**: Convert medical consultations from audio to text using ElevenLabs API
- **Automated Clinical Notes**: Extract structured clinical information (chief complaint, history, examination, diagnosis, treatment plan) using Groq AI
- **Dual User Interface**: Separate dashboards for doctors and patients with role-based access
- **Real-time Notifications**: Stay updated with appointment reminders and medication schedules
- **Medication Management**: Track prescriptions and dosage schedules
- **Patient Records**: Comprehensive view of patient history, consultations, and health metrics



## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: For version control

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory (if backend integration is required):
   ```env
   VITE_API_URL=http://localhost:5001
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`


## 🏗️ Architecture

The Cureloop platform follows a modern client-server architecture with AI service integration:

### High-Level Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │◄───────►│   Backend   │◄───────►│  Database   │
│   (React)   │  REST   │   (Flask)   │  ORM    │  (SQLite)   │
└─────────────┘   API   └─────────────┘         └─────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │   AI Services Layer  │
                   ├──────────────────────┤
                   │ • ElevenLabs (STT)   │
                   │ • Groq (NLP)         │
                   │ • MiniMax (optional) │
                   └──────────────────────┘
```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── layouts/         # Page layouts
│   ├── lib/             # Utility functions and types
│   ├── pages/           # Route pages
│   └── App.tsx          # Main application component
├── helpfiles/           # API documentation and guides
└── public/              # Static assets
```

## User Roles

### Doctor Dashboard
- View and manage patient list
- Conduct consultations with audio recording
- Generate automated clinical notes
- Review patient history and medications

### Patient Dashboard
- View upcoming appointments
- Access medication schedules
- Review consultation history
- Check health metrics and vitals

## Development

The application uses modern React patterns:

- **Functional Components** with hooks
- **Type-safe** with TypeScript
- **Component composition** using Radix UI primitives
- **Responsive design** with Tailwind CSS
- **Form validation** with Zod schemas

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is part of a hackathon submission.

## Support

For issues or questions, please open an issue in the repository.
