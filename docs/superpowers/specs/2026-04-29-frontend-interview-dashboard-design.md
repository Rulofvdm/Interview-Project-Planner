# Frontend Interview Dashboard — Design

**Date:** 2026-04-29
**Status:** Approved (awaiting implementation plan)
**Owner:** Dylan Jansen

## Purpose

A self-contained Angular application used during live, in-person interviews for junior to mid-level frontend engineers. The interviewer hands a candidate a laptop with the project running. The candidate has 60 minutes to fill in an empty `/dashboard` route by consuming a local mock API. The interviewer observes how the candidate handles real Angular work: idiomatic framework usage, async/HTTP plumbing, and visual execution.

The interview begins with a discussion. Once that is finished, the laptop is handed over and the timer starts.

## Goals

- A working, realistic Angular site that feels like a product, not a coding pad.
- A pre-wired API so the candidate spends 60 minutes building UI, not plumbing.
- A tiered brief that surfaces prioritisation under time pressure.
- A reset workflow that returns the project to a known clean state between candidates in seconds.
- A fixed checklist the interviewer can grade against without subjectivity drift between candidates.

## Non-goals

- No authentication, no user accounts, no per-candidate state.
- No persistent backend. The API serves from static JSON files.
- No real charting library. The brief asks for stat cards and lists, never graphs.
- No deployment, hosting, Docker, or CI.
- No automated grading. The interviewer reads the diff and makes the call.
- No required tests from the candidate.
- No accessibility audit on the brief. (Strong candidates produce semantic HTML naturally; that is its own signal.)
- No state-management library (NgRx, Akita, signal stores). Plain signals plus the pre-wired service is the expectation.

## Skills assessed

The brief and API are designed to surface three signals:

1. **Angular idioms** — signals, standalone components, `inject()`, the new control flow (`@if`/`@for`).
2. **HTTP / async data handling** — `HttpClient` usage, loading state, error state, empty state.
3. **Visual / CSS execution** — layout, spacing, typography, polish, responsiveness.

State derivation, component composition, and code-quality signals will surface naturally but are not the primary grading axes.

## Architecture

A single repo with two processes, run together via a single `npm start`.

```
frontend-interview-dashboard/
├── api/                              # Node + Express mock API
│   ├── server.js                     # ~50 lines, /api/projects + /api/activity
│   ├── data/
│   │   ├── projects.json             # ~12 projects
│   │   └── activity.json             # ~20 activity items
│   └── package.json
├── web/                              # Angular 20/21 standalone-component app
│   ├── src/app/
│   │   ├── app.routes.ts
│   │   ├── shell/                    # nav + layout
│   │   ├── features/
│   │   │   ├── home/                 # pre-existing landing page
│   │   │   ├── projects-list/        # pre-existing reference page
│   │   │   ├── instructions/         # the interview brief
│   │   │   └── dashboard/            # ← THE EMPTY ROUTE THE CANDIDATE FILLS IN
│   │   └── core/
│   │       └── api.service.ts        # pre-wired HttpClient service
│   └── package.json
├── package.json                      # root: `concurrently` runs api + web
├── docs/superpowers/specs/           # design docs
└── README.md                         # for the interviewer, not the candidate
```

### Why two processes, not one

A real Express server serves real HTTP responses with real status codes. The candidate sees real network activity in DevTools — important when grading async/HTTP hygiene. An in-app `HttpInterceptor` mock layer was rejected because (a) candidates may notice the mock and treat error handling as performative, and (b) the network tab would not show requests, weakening the realism.

A real .NET API matching production was also rejected. The candidate does not care about the backend stack; the interviewer does not want to debug .NET startup failures during a live interview.

### Top-level commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install root, `api/`, and `web/` dependencies. Run once after cloning. |
| `npm start` | Run the API (port 3001) and Angular dev server (port 4200) concurrently. |
| `npm run reset` | Restore the dashboard stub to its empty state. Runs `git checkout -- web/src/app/features/dashboard/` (reverts edits to tracked files) followed by `git clean -fd web/src/app/features/dashboard/` (removes any new files the candidate created — `StatCard`, child components, etc.). Idempotent. Touches only the dashboard folder; other changes are safe. |

## Pre-existing site features

The candidate sees a real product, not a blank canvas. Four routes:

### `/` — Home

A bland landing page. App name, short blurb ("Track your team's projects and activity"), CTA linking to `/dashboard`. Deliberately unstyled — not a place to look for visual inspiration.

### `/projects` — Projects list (reference)

A working, polished page that hits `/api/projects` and renders a list (name, status, owner, due date). Three purposes:

1. Demonstrates the codebase patterns the candidate is expected to follow (signals, standalone components, `inject()`, new control flow).
2. Confirms the API is alive — if anything is broken at the start of the session, it surfaces here, not on the empty dashboard route.
3. Establishes the visual design system (see "Visual design system" below) so the candidate has a defined aesthetic to either work within or deliberately deviate from.

This page must use the exact Angular patterns the candidate is expected to use. If it uses `*ngIf` or constructor injection, the brief is sending mixed signals.

### `/instructions` — The brief

The interview spec rendered as a real Angular route (proper styling, scannable, navigable from the top nav). Detail in the "Instructions" section below.

### `/dashboard` — The empty stub the candidate builds

A `<h1>Dashboard</h1>` and a comment block in `dashboard.component.ts`. That's it. Their canvas.

### Top nav

Lists all four routes. The dashboard nav link is highlighted/labelled "← Build me" so there's zero ambiguity about where the work happens.

## Visual design system

The pre-built site uses a **Windows 10 aesthetic** — flat, clean, accent-blue, Segoe UI typography. The intent is that the app feels like a polished internal product, not a coding pad, and that the candidate has a defined visual language available when building the dashboard.

### Why Windows 10

- It's a recognisable, well-defined design language — no ambiguity about what the app should look like.
- It maps cleanly to CSS variables (a small set of colours, one font, simple borders, light shadows) — easy to maintain and easy for the candidate to consume.
- It pairs naturally with internal-tooling content (project lists, activity feeds, stat cards) — exactly what we're building.

### Tokens

Defined as CSS custom properties in `web/src/styles.scss` (or equivalent). The candidate can reference them when building the dashboard or override them if they want to deviate.

```scss
:root {
  // Surfaces
  --bg-app:        #F3F3F3;   // page background
  --bg-panel:      #FFFFFF;   // cards, panels
  --bg-hover:      #F5F5F5;   // row hover, list-item hover
  --bg-selected:   #E5F1FB;   // selected row, active nav

  // Borders & dividers
  --border-subtle: #E1E1E1;
  --border-strong: #C8C8C8;

  // Text
  --text-primary:   #1F1F1F;
  --text-secondary: #5C5C5C;
  --text-muted:     #8A8A8A;
  --text-on-accent: #FFFFFF;

  // Accent (Windows 10 blue)
  --accent:         #0078D4;
  --accent-hover:   #106EBE;
  --accent-pressed: #005A9E;

  // Status colours (used for project status pills)
  --status-not-started: #8A8A8A;
  --status-in-progress: #0078D4;
  --status-overdue:     #D13438;
  --status-completed:   #107C10;

  // Type
  --font-stack: "Segoe UI", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-size-base: 14px;
  --font-size-sm:   12px;
  --font-size-lg:   16px;
  --font-size-xl:   20px;

  // Radius — Windows 10 is mostly square, with very subtle rounding
  --radius-sm: 2px;
  --radius-md: 4px;

  // Shadows — minimal, used sparingly
  --shadow-card:  0 1px 2px rgba(0, 0, 0, 0.08);
  --shadow-popup: 0 4px 16px rgba(0, 0, 0, 0.14);

  // Spacing scale
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
}
```

### Component conventions

- **Cards / panels**: white background, 1px border (`--border-subtle`), 4px radius, 16–24px internal padding, optional minimal shadow. No heavy elevation.
- **Top nav**: dark accent bar (`--accent`) with light text, OR a light bar with `--text-primary`. Pick one and apply globally.
- **Buttons**: flat. Primary buttons use `--accent`; secondary buttons are bordered with `--border-strong`. Hover/pressed states use the matching accent variants.
- **Tables / lists**: clean 1px row borders, hover row uses `--bg-hover`, header row slightly bolder.
- **Status pills**: small, rounded-rectangle (4px), coloured background using the matching `--status-*` token, white text or dark depending on contrast.
- **Avatars**: 28–32px coloured circles using `owner.avatarColor`, with `owner.initials` centred in white.
- **Icons**: optional. If used, prefer Segoe Fluent Icons via web font, or simple SVGs. Don't ship a heavy icon library for an interview project.

### What this means for the candidate

The brief will note: "The site uses a Windows 10 design system. CSS variables are defined in `styles.scss`. Use them, extend them, or override them — just be intentional. We're looking for visual cohesion or deliberate, justified deviation, not arbitrary styling choices."

This shifts the visual signal from "can they invent a design from scratch" to "can they work within (or thoughtfully against) a defined system" — closer to real engineering work.

## API

Two endpoints. Open CORS (`*`). All responses sleep a random 20–500ms before responding.

### `GET /api/projects`

Returns an array of projects. ~12 items in seed data, mix of statuses (including 2–3 overdue and 2–3 completed so the stat cards aren't all zero).

```json
[
  {
    "id": "p_001",
    "name": "Apollo Migration",
    "description": "Migrate legacy auth service to new platform",
    "status": "in_progress",
    "owner": {
      "id": "u_03",
      "name": "Sarah Chen",
      "initials": "SC",
      "avatarColor": "#5B8DEF"
    },
    "dueDate": "2026-06-15",
    "progress": 0.65,
    "tasksTotal": 24,
    "tasksDone": 16,
    "tags": ["backend", "infra"]
  }
]
```

`status` is one of: `"not_started" | "in_progress" | "completed" | "overdue"`.

### `GET /api/activity`

Returns an array of recent activity, sorted newest-first, timestamps spread across the last 7 days. ~20 items in seed data.

```json
[
  {
    "id": "a_001",
    "type": "task_completed",
    "actor": { "id": "u_03", "name": "Sarah Chen", "initials": "SC" },
    "projectId": "p_001",
    "projectName": "Apollo Migration",
    "message": "completed \"Database schema review\"",
    "timestamp": "2026-04-29T08:32:00Z"
  }
]
```

`type` is one of: `"task_completed" | "project_created" | "comment_added" | "status_changed"`.

### Test modes

Both endpoints support two query parameters for state-handling tests:

| Query | Behaviour |
| --- | --- |
| `?fail=true` | Returns `500 Internal Server Error` with `{ "error": "Something went wrong" }`. |
| `?empty=true` | Returns `[]`. |

Failures are deterministic — only triggered by the query string, never random. A frustrated candidate is not the goal.

### Why owner avatars use initials, not URLs

Each `owner` carries `initials` and `avatarColor` (a hex string). The candidate renders a coloured circle with initials. Real avatar URLs would add another async failure mode (image 404s) and shift focus away from the brief.

### Artificial delay rationale

The 20–500ms range is intentionally wide. At the low end, a naive loading-state implementation produces a visible flash. At the high end, the loading state is clearly perceptible. Candidates who only test under one condition will ship a janky flicker; candidates who consider both may reach for a "show after Nms" pattern or skeleton placeholder. The variability itself is a signal.

### Pre-wired API service

`web/src/app/core/api.service.ts` exposes:

```typescript
getProjects(): Observable<Project[]>
getActivity(): Observable<ActivityItem[]>
```

The `Project` and `ActivityItem` types are exported. The candidate imports them and never has to invent shapes. Any candidate spending 10 minutes typing an interface for the API response is doing work the spec has already done for them.

## Instructions

The brief lives at `/instructions` as a real Angular route. The candidate can keep it open in a second tab while working.

### Layout of the brief

1. **Header** — "Frontend Interview: Build a Project Dashboard" plus estimated time (60 minutes).
2. **Context** (2 sentences) — explains that the candidate is building the `/dashboard` route, that the rest of the site is already built, and that `/projects` is a reference for the codebase's Angular patterns.
3. **Tiered checklist** — the items in the "Tier breakdown" section below.
4. **API reference** — both endpoints, sample responses, the `?fail=true` and `?empty=true` query params, the 20–500ms delay note, and a suggestion to use Chrome DevTools network throttling to verify the loading UI under slower conditions.
5. **Pre-wired helpers** — explicit list: `ApiService` with typed methods, `Project` and `ActivityItem` types, route already registered.
6. **Tips** — "Commit when you finish each tier so we can see your progress." "If you're stuck, talk it through — we're not grading silence." "Polish matters, but only after Must-have works." "The laptop's display may not match the test resolutions; resize the browser window to verify." "The site uses a Windows 10 design system with CSS variables in `styles.scss`. Use them, extend them, or override them — just be intentional."
7. **What we're looking for** — three plain-language bullets: idiomatic Angular 20+, real handling of loading/error/empty, visual taste — does the dashboard feel considered.
8. **Sign-off** — "Good luck!"

### Second touchpoint inside the dashboard component

`dashboard.component.ts` opens with a comment block summarising the brief and pointing to `/instructions` for the full version. The candidate sees the summary in the file they are editing and never has to alt-tab to find what to do.

```typescript
/**
 * Build the dashboard here. Full brief: /instructions
 *
 * API service is pre-wired in core/api.service.ts:
 *   - apiService.getProjects()   → Observable<Project[]>
 *   - apiService.getActivity()   → Observable<ActivityItem[]>
 *
 * Tier checklist:
 *   Must:   stat cards (Total / In Progress / Overdue / Completed),
 *           project list/table, loading + error states
 *   Should: activity feed, responsive layout, visual polish
 *   Nice:   filter or sort, empty state, status badge component
 */
```

### Tone

Businesslike, friendly enough to include "Good luck!", but not chatty. No emojis. This is the brief the new hire would get on day one — that is the calibration.

## Tier breakdown

The actual checklist on `/instructions`. Each item is a concrete deliverable, not a value statement. Order within each tier is roughly the order in which to do the work.

### Must-have — without these, the build doesn't ship

1. **Fetch and display projects.** Call `apiService.getProjects()`. Render the list (table, card grid — the candidate's choice).
2. **Stat cards row.** Four cards across the top: **Total**, **In Progress**, **Overdue**, **Completed**. Each shows a count derived from the projects data.
3. **Loading state.** While projects are fetching, show a loading indicator. The API delay varies (20–500ms) — the loading UI should feel intentional under both conditions.
4. **Error state.** If the API fails (test with `?fail=true`), show a clear error message. Do not render the dashboard as if it were empty.

### Should-have — depth and polish

5. **Activity feed.** Call `apiService.getActivity()` and render the recent activity list somewhere on the dashboard. Format timestamps in a friendly way ("2h ago", or another sensible format).
6. **Responsive layout.** Looks good on a typical desktop (≥1280px) and at **1920×1080 with 125% Windows scaling** (effective ~1536×864 — common in our user base). Acceptable down to ~768px. Stat cards stack or wrap; the project list remains usable.
7. **Visual polish.** Consistent spacing, sensible typography, hover states where appropriate. Status should be visually distinguishable (a coloured badge or pill, not just text). Either work within the existing Windows 10 design system (CSS variables in `styles.scss`) or deliberately deviate — both are valid, arbitrary styling is not.

### Nice-to-have — if there's time

8. **Filter or sort the project list.** Pick one (status filter, owner filter, sort by due date). Use Angular signals or computed values.
9. **Empty state.** Test with `?empty=true`. Show something useful when there are no projects/activity instead of a blank panel.
10. **Component decomposition.** Break the dashboard into 2–3 smaller components (e.g. `StatCard`, `ProjectListItem`, `ActivityFeed`) rather than one big file.

### Tiering rationale

- Item 10 (component decomposition) is in Nice-to-have on purpose. Mandating it at junior-to-mid produces cargo-culted splits ("I made a `<header>` component because the spec said to"). Leaving it as a Nice-to-have surfaces who reaches for it naturally — a stronger signal than compliance.
- Order within each tier is the suggested working order. Skipping items signals priorities.
- Realistic targets: a strong mid-level candidate finishes Must + Should and lands one Nice-to-have. A junior finishes Must and starts Should. Anyone clearing all three tiers with polish in 60 minutes is a hire.

## Operational workflow

### Before the candidate arrives

1. `git status` — verify clean working tree.
2. `npm run reset` — restores the dashboard stub. Idempotent.
3. `npm start` — launches both processes. Wait for both to come up.
4. Open `http://localhost:4200/instructions` so the brief is the first thing on screen.

### During the interview

The candidate works in `web/src/app/features/dashboard/`. Hot-reload picks up changes automatically. Encourage them to commit between tiers (`git add . && git commit -m "Must-have done"`) — this is listed as a tip in the brief, not a requirement. If they crash the dev server, `npm start` in a fresh terminal recovers them in seconds.

### After the candidate leaves

1. `git log --oneline` — read commit cadence.
2. Diff against the empty stub to see what was actually built.
3. If the artefact is worth keeping, `git branch candidate-<name>-<date>`. Then `npm run reset`.

### README for the interviewer (not the candidate)

A short `README.md` at the repo root with the four commands above, a "What to listen for" reminder of the three grading signals, and troubleshooting notes (ports in use, fresh `npm install`, where seed data lives if it needs tweaking).

### Reset safety

`npm run reset` only touches `web/src/app/features/dashboard/`. It runs both `git checkout` (to revert tracked-file edits) and `git clean -fd` (to remove any untracked files the candidate created — new components, styles, etc.) within that folder. It will NOT discard changes in other directories. If the API or other parts of the app have been edited between candidates, those changes are safe.

## Open questions

None at design time. All decisions confirmed with the user during brainstorming.

## Next steps

1. Implementation plan (handed off to the writing-plans skill).
2. Build the API server, the seed data, and the four routes.
3. Verify the candidate flow end-to-end on a fresh machine before the first interview.
