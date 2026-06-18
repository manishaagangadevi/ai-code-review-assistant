# Architecture Documentation

## Overview

AI Code Review Assistant is a full-stack monorepo application that enables developers to upload source code and receive structured AI-generated code reviews through configurable AI providers.

---

## Frontend Architecture

**Framework:** Next.js 14 (App Router) + TypeScript + Tailwind CSS

**Structure:**

frontend/
├── app/
│   ├── (auth)/          # Auth pages (login, register)
│   ├── dashboard/       # Protected dashboard pages
│   │   ├── projects/    # Project management + file explorer
│   │   ├── reviews/     # Review history + search
│   │   ├── chat/        # AI chat interface
│   │   └── settings/    # AI provider configuration
├── components/          # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/                 # Axios API client
├── store/               # Zustand auth state
└── types/               # TypeScript interfaces

**Key Decisions:**
- App Router for file-based routing and layouts
- Zustand for lightweight auth state (no Redux overhead)
- Axios interceptors for automatic JWT injection and 401 redirect
- TanStack Query for server state management

---

## Backend Architecture

**Framework:** NestJS + TypeScript + Prisma ORM

**Structure:**

backend/
├── src/
│   ├── auth/            # JWT auth, bcrypt, Passport strategy
│   ├── projects/        # Project CRUD
│   ├── files/           # ZIP upload, file tree parser
│   ├── reviews/         # AI review engine + templates
│   ├── ai-provider/     # Configurable AI provider abstraction
│   ├── chat/            # AI chat with code context
│   └── prisma/          # Global Prisma service
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # SQL migrations

**Key Decisions:**
- Global PrismaModule so all modules can inject PrismaService
- AI provider abstraction layer — any OpenAI-compatible endpoint works
- JWT via Passport with Guards on all protected routes
- Multer for in-memory ZIP processing (no temp files)
- AdmZip for ZIP extraction with binary file filtering

---

## Database Design

**Database:** PostgreSQL via Prisma ORM

| Table | Purpose |
|-------|---------|
| users | Stores user accounts with hashed passwords |
| projects | Code projects belonging to a user |
| files | Uploaded files associated with a project |
| reviews | AI review results stored as JSON |
| ai_providers | User-configured AI provider settings |
| chat_sessions | Chat sessions scoped to a project |
| messages | Individual chat messages per session |

**Key Decisions:**
- UUIDs as primary keys for all tables
- Cascade deletes — deleting a project removes all its files, reviews, and chats
- Review issues and recommendations stored as JSON for flexibility
- AI provider API keys stored per user (not global)

---

## AI Integration Flow

User clicks "Run Review"
→ ReviewsController POST /api/reviews
→ ReviewsService.create()
→ Fetch files from DB (all or selected)
→ AiProviderService.getProviderWithClient()
   Loads user's default/selected provider
   Creates OpenAI-compatible client with baseURL
→ Build system prompt based on template:
   security | performance | quality | documentation | techdebt
→ Send code + prompt to AI provider
→ Parse JSON response (summary, issues, recommendations, severity)
→ Save review to DB
→ Return structured review to frontend

---

## AI Provider Abstraction

The system uses the OpenAI SDK with a configurable baseURL, making it compatible with:
- OpenAI (https://api.openai.com/v1)
- LM Studio (http://localhost:1234/v1)
- Ollama (http://localhost:11434/v1)
- OpenRouter (https://openrouter.ai/api/v1)
- Any OpenAI-compatible endpoint

Provider config (baseURL, apiKey, modelName) is stored per user in the database — never hardcoded.