# InterviewFlow AI

AI Interview and Resume Analyzer built with React.js, Node.js, Express.js, MongoDB Atlas, JWT authentication, bcrypt.js, Multer and Gemini API.

## Features

- JWT registration, login and protected routes
- Password hashing with bcrypt.js
- Resume upload, preview, replace/delete and history
- PDF text extraction and Gemini-powered resume analysis
- Skill, project, education and experience extraction
- Missing skill detection, resume summary and improvement suggestions
- HR, technical, project-based and behavioral interview generation
- Easy, medium and hard difficulty levels
- Company-specific question mode
- AI answer feedback with strengths, weaknesses, suggestions and score
- Dashboard with resume summary, history, scores and progress tracking
- Profile update and change password
- AI cover letter generator
- Favorite questions
- PDF interview report export
- Dark mode
- MVC backend with REST APIs, validation and centralized error handling

## Tech Stack

- Frontend: React.js, Vite, React Router, Axios, lucide-react
- Backend: Node.js, Express.js, MongoDB Atlas, Mongoose
- Auth: JWT, bcrypt.js
- Files: Multer, pdf-parse
- AI: Gemini API
- Reports: PDFKit

## Folder Structure

```text
interviewflow-ai/
  client/          React frontend
  server/          Express MVC backend
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
      utils/
```

## Setup

1. Install dependencies:

```bash
npm install
npm run install:all
```

2. Configure backend environment:

```bash
copy server\.env.example server\.env
```

Update `server/.env`:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

3. Configure frontend environment:

```bash
copy client\.env.example client\.env
```

4. Run both apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/auth/profile`
- `PATCH /api/auth/password`
- `POST /api/resumes`
- `GET /api/resumes`
- `GET /api/resumes/active`
- `GET /api/resumes/:id`
- `GET /api/resumes/:id/preview`
- `POST /api/resumes/:id/analyze`
- `DELETE /api/resumes/:id`
- `POST /api/interviews/generate`
- `GET /api/interviews`
- `GET /api/interviews/:id`
- `PATCH /api/interviews/:id/questions/:questionId/favorite`
- `POST /api/interviews/:id/evaluate`
- `GET /api/interviews/:id/report`
- `POST /api/cover-letter`
- `GET /api/dashboard`

## Notes

If `GEMINI_API_KEY` is not set, the backend returns demo fallback AI data so the UI remains usable for presentation. Add the key for real Gemini responses.
