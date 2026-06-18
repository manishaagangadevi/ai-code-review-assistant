# AI Code Review Assistant

An AI-powered code review assistant built with Next.js, NestJS, PostgreSQL, and configurable AI providers (OpenAI, LM Studio, Ollama, OpenRouter).

## Features

- Authentication (Register, Login, Logout) with JWT
- Project Management (Create, View, Delete)
- ZIP file upload with file tree explorer and syntax highlighting
- AI Code Reviews with 5 templates:
  - Security Review
  - Performance Review
  - Code Quality Review
  - Documentation Generator
  - Tech Debt Scanner
- Review History with search and filtering
- AI Chat with uploaded code as context
- Configurable AI Providers (OpenAI, LM Studio, Ollama, OpenRouter, any OpenAI-compatible endpoint)

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Zustand, TanStack Query
- **Backend:** NestJS, Prisma ORM, PostgreSQL, JWT, Passport
- **AI:** OpenAI SDK with configurable baseURL

## Environment Variables

### Backend (backend/.env)
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/ai_code_review

JWT_SECRET=your-jwt-secret

JWT_EXPIRES_IN=7d

PORT=3001

### Frontend (frontend/.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL

### Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Architecture Overview

- Frontend runs on port 3000, Backend on port 3001
- All API routes are prefixed with /api
- JWT token stored in localStorage, injected via Axios interceptor
- AI provider config stored per user in database — never hardcoded
- See ARCHITECTURE.md for full details

## AI Usage

See AI_USAGE.md for full disclosure of AI tools used, prompts, and engineering decisions. 
