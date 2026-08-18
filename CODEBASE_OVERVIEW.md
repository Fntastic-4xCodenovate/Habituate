## HABITUATE Codebase Overview

This document explains the theory, architecture, and implementation of the HABITUATE project based on a full review of the authored source files in this repository.

Generated artifacts such as `.next/`, `__pycache__/`, and `tsconfig.tsbuildinfo` are intentionally excluded from this explanation because they are build outputs, not core source.

## What The Project Is

HABITUATE is a gamified habit-tracking application.

Its product theory is:

- Habits are the core unit.
- Completing habits creates streaks.
- Streaks and completions award XP.
- XP drives levels.
- Levels, badges, extra lives, leaderboards, and clans turn personal consistency into a game loop.
- Clans add a social loop, where individual progress also helps a team progress.

This theory shows up most clearly in:

- `backend/services/streak_service.py`
- `backend/services/xp_service.py`
- `backend/services/leveling.py`
- `backend/services/badge_service.py`

## High-Level Architecture

This is not a clean frontend-only-to-backend system. It is a hybrid architecture:

```text
Clerk auth
   ->
Next.js frontend
   -> direct browser reads/writes to Supabase
   -> REST calls to FastAPI
   -> Socket.IO connection to FastAPI
FastAPI
   -> reads/writes the same Supabase database
```

Core technologies:

- Next.js 15 App Router frontend: `package.json`
- Clerk authentication: `app/layout.tsx`, `middleware.ts`
- Supabase database and storage: `lib/supabase.ts`
- FastAPI backend: `backend/main.py`
- Socket.IO realtime layer: `backend/main.py`, `lib/socket.ts`

## Repository Structure

- `app/`: Next.js routes and pages
- `components/`: shared UI components
- `hooks/`: client-side behavior hooks
- `lib/`: frontend service clients and helpers
- `backend/`: Python backend with routes, models, and services
- `public/`: static assets like avatars, logo, and landing video

## Frontend Theory And Implementation

The frontend is primarily a client-rendered Next.js application.

Important shell files:

- `app/layout.tsx`
  - wraps the app in `ClerkProvider`
  - wraps children in `BackendInitializer`
- `middleware.ts`
  - defines public and protected routes using Clerk middleware
- `app/globals.css`
  - defines the visual identity: dark theme, neon glow, glitch text, retro styling

### Main Frontend Routes

- `/`: landing page in `app/page.tsx`
- `/auth`: combined sign-in/sign-up page in `app/auth/[[...rest]]/page.tsx`
- `/sign-in`: Clerk sign-in page in `app/sign-in/[[...sign-in]]/page.tsx`
- `/sign-up`: Clerk sign-up page in `app/sign-up/[[...sign-up]]/page.tsx`
- `/onboarding`: profile setup in `app/onboarding/page.tsx`
- `/dashboard`: summary page and quick habit actions in `app/dashboard/page.tsx`
- `/habits`: main habit management page in `app/habits/page.tsx`
- `/leaderboard`: rankings page in `app/leaderboard/page.tsx`
- `/profile`: user profile page in `app/profile/page.tsx`
- `/settings`: editable profile and clan controls in `app/settings/page.tsx`
- `/clans`: clan browse/join/create page in `app/clans/page.tsx`
- `/clan`: current clan dashboard, management, and chat in `app/clan/page.tsx`

### Shared Frontend Infrastructure

- `lib/supabase.ts`
  - initializes browser-side Supabase client
  - contains helper functions for habits, profiles, leaderboards, and avatar uploads
- `lib/api.ts`
  - REST client for the Python backend
- `lib/socket.ts`
  - singleton Socket.IO manager
- `components/Navbar.tsx`
  - loads top-level profile, XP, level, and badges for nav display
- `components/BackendInitializer.tsx`
  - checks whether the signed-in user has completed onboarding
- `hooks/useBackendUser.ts`
  - tries to fetch or register the user in the backend and opens a socket connection
- `hooks/useClanChat.ts`
  - loads clan chat history and subscribes to live messages

## The Frontend's Real Data Model

Although there is a FastAPI backend, the frontend often treats Supabase as the real application backend.

Examples:

- Onboarding writes directly to `user_profiles`: `app/onboarding/page.tsx`
- Dashboard reads and writes habits directly: `app/dashboard/page.tsx`
- Habits page also reads and writes habits directly: `app/habits/page.tsx`
- Settings updates profile and uploads avatars directly to Supabase Storage: `app/settings/page.tsx`
- Clans page uses Supabase RPCs directly for create/join/leave: `app/clans/page.tsx`

So the browser owns a large amount of application behavior.

## Backend Theory And Implementation

The backend is a FastAPI app that adds domain logic, computed reads, and realtime behavior.

Core backend wiring:

- `backend/main.py`
  - creates the FastAPI app
  - registers all routers
  - creates the Socket.IO server
  - exposes `socket_app` as the ASGI entrypoint
- `backend/config.py`
  - runtime settings via `pydantic-settings`
- `backend/start.py`
  - convenience startup script

The backend is layered into:

- models in `backend/models/`
- route handlers in `backend/routes/`
- business services in `backend/services/`

## Domain Objects And Tables

The project revolves around these main records:

- `user_profiles`
- `habits`
- `habit_logs`
- `clans`
- `clan_members`
- `clan_messages`
- `badges`
- `user_badges`
- `quests`
- `user_quests`

The database wrapper exposing most of this lives in `backend/services/database.py`.

The intended schema and rules are expressed by:

- users and leveling: `backend/models/user.py`
- habits: `backend/models/habit.py`
- clans: `backend/models/clan.py`
- badges: `backend/models/badge.py`
- quests: `backend/models/quest.py`

## Backend Services

### `backend/services/database.py`

This is a thin wrapper over the Supabase Python client.

- No ORM is used.
- Most methods directly call `.table(...).select()/insert()/update()/delete().execute()`.
- It acts as the persistence layer for routes and services.

### `backend/services/leveling.py`

This is the intended source of truth for user leveling.

Responsibilities:

- map XP to level
- compute progress to next level
- detect level-up jumps
- describe milestone rewards

Important functions:

- `level_from_xp`
- `progress_from_xp`
- `check_level_up`
- `get_level_rewards`

### `backend/services/xp_service.py`

This is the main XP and progression orchestrator.

Responsibilities:

- award XP
- update user level and total points
- contribute earned XP to clan XP
- detect clan level-ups
- award streak bonuses
- award extra lives
- emit PostHog analytics when configured

### `backend/services/streak_service.py`

This is the intended habit completion pipeline.

Responsibilities:

- prevent duplicate same-day completion
- compute the new streak
- update best streak
- write habit logs
- update habit state
- call `XPService`
- apply streak bonuses and extra-life awards

### `backend/services/badge_service.py`

This handles achievement progression.

Responsibilities:

- initialize predefined badge definitions
- check badge thresholds for streaks, completions, levels, and clan contribution
- award badges
- calculate badge progress

### `backend/services/websocket_manager.py`

This is an in-memory notification helper for user/clan websocket messages.

It is separate from the Socket.IO server in `backend/main.py`.

## Backend Routes

- `backend/routes/auth.py`
  - backend-side user bootstrap based on Clerk ID
- `backend/routes/habits.py`
  - habit CRUD and intended completion path
- `backend/routes/profile.py`
  - profile fetch/update and level-progress views
- `backend/routes/leaderboard.py`
  - user and clan ranking endpoints
- `backend/routes/clans.py`
  - clan CRUD-like actions, member listing, message history
- `backend/routes/badges.py`
  - user badges and badge progress
- `backend/routes/quests.py`
  - active quests and static daily/weekly quests
- `backend/routes/discover.py`
  - public habit discovery and habit adoption
- `backend/routes/xp.py`
  - manual/test XP endpoints

## Three Important End-To-End Flows

### 1. Sign Up And Onboarding

- Clerk authenticates the user.
- `BackendInitializer` checks `user_profiles.profile_completed`.
- If incomplete, the user is redirected to `/onboarding`.
- `/onboarding` writes the profile directly to Supabase.

Main files:

- `components/BackendInitializer.tsx`
- `app/onboarding/page.tsx`

### 2. Habit Completion

The intended backend flow is:

- `backend/routes/habits.py`
- `backend/services/streak_service.py`
- `backend/services/xp_service.py`
- `backend/services/badge_service.py`

But the actual frontend usually bypasses that and writes directly to Supabase:

- dashboard path: `app/dashboard/page.tsx`
- habits page path: `app/habits/page.tsx`

This is one of the biggest architectural facts in the project.

### 3. Clan Chat

- chat history is loaded over REST in `hooks/useClanChat.ts`
- clan room join/leave is handled by Socket.IO events in `backend/main.py`
- live messages are broadcast by Socket.IO in `backend/main.py`
- persistent message history is exposed by `backend/routes/clans.py`

## The Most Important Architectural Truth

The codebase contains two overlapping theories:

- Intended theory: the Python backend should own gamification logic.
- Actual implementation: the browser often writes directly to Supabase and only partially uses FastAPI.

That makes the project feel split between two sources of truth.

## Important Current Realities

These shape how the system really behaves today.

### Partial route protection

`middleware.ts` protects:

- `/dashboard`
- `/profile`
- `/habits`
- `/leaderboard`
- `/onboarding`
- `/settings`

But it does not protect `/clan` or `/clans`.

### Partial onboarding gate

`components/BackendInitializer.tsx` only treats some pages as protected during profile-completion checks.

### Frontend/backend API drift

`lib/api.ts` and the Python routes are not fully aligned.

Examples:

- `lib/api.ts` calls `/habits/?user_id=...`, while backend exposes `/habits/user/{user_id}`
- `lib/api.ts` expects badge routes shaped like `/badges/{id}`, while backend exposes `/badges/user/{id}`
- quests and discover route shapes also differ between client and backend

### Chat URL hardcoding

`hooks/useClanChat.ts` fetches message history from hardcoded `http://localhost:8000/...` instead of using `NEXT_PUBLIC_API_URL`.

### Chat persistence and broadcasting are split

- socket send path is in `hooks/useClanChat.ts`
- REST persistence path is in `backend/routes/clans.py`

These are not fully unified.

### Leveling logic duplication

Leveling logic exists in multiple places:

- `backend/services/leveling.py`
- `backend/models/user.py`
- clan-level logic again in `app/clan/page.tsx`

This conflicts with the stated goal in `backend/LEVELING_SYSTEM.md` that leveling should have one source of truth.

### Leaderboard source issues

`app/leaderboard/page.tsx` currently contains obvious source-level issues, including duplicate type declarations and a missing icon import.

### Missing top-level documentation

`README.md` is effectively empty, so the code itself is the real source of truth.

## Practical Mental Model

The simplest accurate description of the project is:

HABITUATE is a Clerk-authenticated Next.js social habit app that stores much of its live state directly in Supabase, while a separate FastAPI plus Socket.IO backend tries to own gamification and realtime behavior, but only partially does so because many important flows bypass it.

## Most Important Files To Read First

If you need to understand the project quickly, read these first:

- `app/layout.tsx`
- `middleware.ts`
- `lib/supabase.ts`
- `lib/api.ts`
- `app/onboarding/page.tsx`
- `app/habits/page.tsx`
- `app/clans/page.tsx`
- `app/clan/page.tsx`
- `backend/main.py`
- `backend/services/database.py`
- `backend/services/streak_service.py`
- `backend/services/xp_service.py`
- `backend/services/leveling.py`
- `backend/services/badge_service.py`

## Conclusion

The project has a clear product idea and a strong gamification direction:

- personal habits
- streak-based reinforcement
- RPG-like progression
- social/clan motivation

The main implementation challenge is not lack of features. It is architectural split:

- browser-side direct Supabase behavior
- backend-side business logic
- incomplete alignment between the two

Understanding that split is the key to understanding the whole repository.
