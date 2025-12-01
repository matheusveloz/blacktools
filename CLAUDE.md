# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BlackTools is a SaaS platform for AI video generation with a visual workflow editor (similar to n8n). Users create videos using multiple AI tools (LipSync, Sora 2, Veo 3, Avatar generation) through a node-based workflow interface.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with dark mode default
- **Database/Auth**: Supabase (PostgreSQL + Auth with Email/Google OAuth)
- **Payments**: Stripe (subscriptions, webhooks)
- **State Management**: Zustand
- **UI Components**: shadcn/ui (Radix UI)
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **Canvas**: react-zoom-pan-pinch

## Commands

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Production build
npm run start    # Run production server
npm run lint     # Run ESLint
```

## Architecture

### Route Structure (App Router)

- `app/(auth)/` - Login, signup, callback routes
- `app/(marketing)/` - Landing page (public)
- `app/(dashboard)/` - Protected routes (dashboard, settings)
- `app/pricing/` - Pricing page
- `app/api/` - API routes (auth, stripe, user)

### Core Systems

**Route Protection** (`middleware.ts`):
- Protects `/dashboard`, `/settings` routes
- Redirects unauthenticated users to `/login`
- Redirects users without active subscriptions to `/pricing`

**Workflow State** (`stores/workflow-store.ts`):
Zustand store managing nodes, connections, zoom/pan, selection, and execution state.

**Workflow Operations** (`hooks/use-workflow.ts`):
Hook for creating nodes, managing connections, initializing tool workflows, and executing workflows.

**Tool Configuration** (`lib/constants.ts`):
Defines 4 tools (LipSync, Sora 2, Veo 3, Avatar) and 12 node types with preset node sequences and credit costs.

### Database Schema (Supabase)

**profiles**: User data, credits, Stripe subscription info
**workflows**: Saved workflows with nodes/connections as JSON
**generations**: AI generation history with status, results, credits used

### Key Data Flow

1. User authenticates via Supabase Auth
2. Middleware checks auth + subscription status
3. Dashboard loads workflow state from Zustand store
4. User manipulates nodes via drag-drop (dnd-kit) on zoomable canvas
5. Workflow execution triggers API calls, deducts credits
6. Stripe webhooks update subscription/credits in profiles table

## Path Aliases

`@/*` maps to root directory (configured in tsconfig.json and components.json)

## Environment Variables

Required in `.env.local` (see `.env.local.example`):
- Supabase: URL, anon key, service role key
- Stripe: Secret key, publishable key, webhook secret, price IDs
- App URL

## Important Patterns

- All UI components use shadcn/ui from `components/ui/`
- Supabase clients: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server)
- Stripe logic centralized in `lib/stripe/` and `app/api/stripe/`
- Type definitions in `types/` directory match Supabase schema
