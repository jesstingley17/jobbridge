# The Job Bridge

## Overview

The Job Bridge is an AI-powered employment platform designed specifically for people with disabilities. It provides accessible job searching, AI-assisted resume building, interview preparation tools, and application tracking. The platform emphasizes WCAG 2.1 accessibility compliance while maintaining a modern, professional user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with CSS variables for theming
- **Component Library**: shadcn/ui (Radix UI primitives with custom styling)
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom plugins for Replit integration

The frontend follows a standard SPA structure with pages in `client/src/pages/` and reusable components in `client/src/components/`. The UI component library lives in `client/src/components/ui/` using the shadcn/ui pattern.

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful endpoints under `/api/*`
- **AI Integration**: OpenAI API (configured via environment variables for AI integrations)

The server uses a simple Express setup with routes registered in `server/routes.ts`. In development, Vite middleware handles frontend assets; in production, static files are served from the build output.

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in `shared/schema.ts` using Drizzle's table definitions
- **Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod
- **Current Storage**: In-memory storage implementation (`MemStorage` class) with seeded sample data

The schema includes tables for users, jobs, applications, resumes, and interview sessions. The storage interface (`IStorage`) allows swapping between in-memory and database implementations.

### Development vs Production
- **Development**: Uses Vite dev server with HMR, `tsx` for TypeScript execution
- **Production**: Builds client with Vite, bundles server with esbuild, serves static files from `dist/public`

## External Dependencies

### AI Services
- **OpenAI API**: Used for resume generation, interview question generation, and answer analysis. Configured via `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY` environment variables.

### Database
- **PostgreSQL**: Required for production. Connection string via `DATABASE_URL` environment variable. Drizzle Kit handles schema migrations stored in `/migrations`.

### Key NPM Packages
- `@tanstack/react-query`: Async state management
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `zod`: Runtime validation
- `express`: HTTP server
- `wouter`: Client-side routing
- Radix UI primitives: Accessible UI components