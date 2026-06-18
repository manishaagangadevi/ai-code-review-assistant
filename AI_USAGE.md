# AI Usage Documentation

## AI Tools Used

- **Claude (Anthropic)** — Primary development assistant for architecture design, code generation, and debugging
- **OpenRouter** — AI inference gateway used at runtime for code reviews and chat (meta-llama/llama-3.1-8b-instruct)
- **GitHub Copilot** — Inline code suggestions during development

---

## AI-Assisted Development

### Architecture Design
Claude was used to design the overall system architecture including:
- Monorepo structure (frontend + backend separation)
- Database schema design with proper relations and cascade deletes
- AI provider abstraction layer pattern
- JWT authentication flow

### Generated Code
The following were generated with AI assistance and reviewed/understood before use:
- NestJS module scaffolding (auth, projects, files, reviews, chat, ai-provider)
- Prisma schema with all relations
- JWT strategy and Passport guards
- ZIP file upload and extraction logic
- AI review engine with template-based system prompts
- React components (login, register, dashboard, project explorer, chat)
- Zustand auth store
- Axios interceptor setup

### Manually Written / Modified Code
- Review template system prompts — carefully crafted for structured JSON output
- AI provider abstraction with OpenAI-compatible baseURL switching
- File tree builder algorithm
- Database query logic with proper user scoping
- CORS and global prefix configuration

### Debugging with AI
- Fixed Prisma v7 migration config incompatibility (downgraded to Prisma v5)
- Fixed AdmZip TypeScript import style
- Fixed OpenRouter HTTP-Referer header requirement
- Resolved NestJS module dependency injection order

---

## Prompts Used

### Security Template
You are a security-focused code reviewer. Analyze the code for hardcoded credentials, authentication issues, input validation problems, and injection risks. Return a JSON object with: { summary, issues, recommendations, overallSeverity }

### Performance Template
You are a performance-focused code reviewer. Analyze the code for slow operations, inefficient algorithms, unnecessary database queries, and memory leaks. Return a JSON object with: { summary, issues, recommendations, overallSeverity }

### Code Quality Template
You are a code quality reviewer. Analyze the code for naming conventions, structure, duplicated code, and missing error handling. Return a JSON object with: { summary, issues, recommendations, overallSeverity }

### Documentation Generator
You are a documentation generator. Analyze the codebase and generate README, API documentation, and architectural decisions. Return a JSON object with: { summary, issues, recommendations, overallSeverity, readme, apiDocs }

### Tech Debt Scanner
You are a technical debt analyzer. Analyze the code for outdated patterns, missing tests, complex code, and TODO/FIXME comments. Categorize each item as High/Medium/Low priority. Return a JSON object with: { summary, issues, recommendations, overallSeverity }

---

## Engineering Decisions

### Why NestJS over FastAPI?
NestJS matches the job description preferred stack and provides strong TypeScript support, dependency injection, and modular architecture out of the box.

### Why Prisma v5 over v7?
Prisma v7 introduced breaking changes to datasource configuration. Downgraded to v5 for stability and simpler DATABASE_URL-based configuration.

### Why OpenAI SDK for all providers?
The OpenAI SDK supports custom baseURL, making it compatible with any OpenAI-compatible endpoint (LM Studio, Ollama, OpenRouter). This avoids maintaining multiple provider-specific SDKs.

### Why Zustand over Redux?
Zustand provides minimal boilerplate for simple auth state management. Redux would be overkill for a single auth slice.

### Why ZIP upload?
ZIP upload works offline, requires no GitHub token setup, and covers the broadest use case for uploading entire projects.