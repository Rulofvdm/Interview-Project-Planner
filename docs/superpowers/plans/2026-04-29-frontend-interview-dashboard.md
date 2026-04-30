# Frontend Interview Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-contained Angular 20 + Express interview tool. Candidate fills in an empty `/dashboard` route consuming a local mock API. Reset workflow restores the stub between candidates.

**Architecture:** Single repo, two processes (Angular dev server on 4200, Express API on 3001), launched together via `concurrently`. The Angular app is standalone-component based with a shared `ApiService`, four routes (`/`, `/projects`, `/instructions`, `/dashboard`), and a Windows 10 design system in CSS variables. The Express API serves projects + activity from static JSON with a 20–500ms artificial delay and supports `?fail=true` / `?empty=true` test modes.

**Tech Stack:** Node 20+, Angular 20.x (standalone, signals, new control flow), Express 4, SCSS. Tests use Node's built-in `node:test` + `fetch` for the API, and Angular's `HttpTestingController` for the `ApiService`. No tests for visual components — manual verification only.

**Spec:** `docs/superpowers/specs/2026-04-29-frontend-interview-dashboard-design.md`

---

## File Structure

```
frontend-interview-dashboard/
├── package.json                                    # root: concurrently + reset script
├── .gitignore                                      # node_modules, dist, .angular
├── README.md                                       # interviewer-facing operational notes
├── api/
│   ├── package.json                                # express, cors, node:test
│   ├── server.js                                   # ~80 lines, both endpoints + middleware
│   ├── server.test.js                              # smoke + behavioural tests
│   └── data/
│       ├── projects.json                           # 12 projects, mixed statuses
│       └── activity.json                           # 20 items across 7 days
├── web/
│   ├── package.json
│   ├── angular.json
│   ├── tsconfig.json
│   └── src/
│       ├── main.ts
│       ├── index.html
│       ├── styles.scss                             # Windows 10 design tokens (CSS vars)
│       └── app/
│           ├── app.config.ts                       # provideRouter, provideHttpClient
│           ├── app.component.ts/html/scss          # shell: top nav + router-outlet
│           ├── app.routes.ts                       # 4 lazy routes
│           ├── core/
│           │   ├── models.ts                       # Project, ActivityItem, Owner, Actor
│           │   ├── api.service.ts                  # HttpClient wrapper
│           │   └── api.service.spec.ts             # ApiService unit tests
│           └── features/
│               ├── home/home.component.ts          # landing page
│               ├── projects-list/                  # reference page (polished, Win10)
│               │   └── projects-list.component.ts
│               ├── instructions/                   # the interview brief
│               │   └── instructions.component.ts
│               └── dashboard/                      # ← THE STUB CANDIDATE FILLS IN
│                   └── dashboard.component.ts      # comment block + empty template
└── docs/
    └── superpowers/
        ├── specs/2026-04-29-frontend-interview-dashboard-design.md
        └── plans/2026-04-29-frontend-interview-dashboard.md   ← THIS FILE
```

**Responsibility per file:**

- `api/server.js` — Express app, both endpoints, delay middleware, `?fail`/`?empty` query handling, CORS.
- `api/data/*.json` — static seed data, never written to.
- `web/src/styles.scss` — only design tokens + `body`/element resets. No component-specific styles.
- `web/src/app/core/api.service.ts` — only HTTP plumbing. No business logic. Returns typed Observables.
- `web/src/app/core/models.ts` — only TypeScript interfaces. No runtime code.
- `web/src/app/app.component.*` — only the shell (nav + router outlet). No feature logic.
- `web/src/app/features/*/` — one component per route, self-contained. Each is standalone.

---

## Phase 1: Repo scaffolding

### Task 1: Root package.json and .gitignore

**Files:**
- Create: `package.json`
- Create: `.gitignore`

- [ ] **Step 1: Create root `package.json`**

```json
{
  "name": "frontend-interview-dashboard",
  "version": "1.0.0",
  "private": true,
  "description": "Local Angular 20 + Express interview tool. See docs/superpowers/specs/.",
  "scripts": {
    "install:all": "npm install && npm install --prefix api && npm install --prefix web",
    "start": "concurrently -n api,web -c blue,green \"npm start --prefix api\" \"npm start --prefix web\"",
    "test": "npm test --prefix api && npm test --prefix web",
    "reset": "git checkout -- web/src/app/features/dashboard/ && git clean -fd web/src/app/features/dashboard/"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

- [ ] **Step 2: Create `.gitignore`**

```
node_modules/
dist/
.angular/
*.log
.DS_Store
```

- [ ] **Step 3: Install root deps**

Run: `npm install`
Expected: creates `node_modules/`, `package-lock.json`. No errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: root package.json with concurrently and reset script"
```

---

### Task 2: Initialize Angular workspace

**Files:**
- Create: `web/` (entire Angular workspace via CLI)

- [ ] **Step 1: Generate Angular project**

Run from repo root:

```bash
npx @angular/cli@20 new web --style=scss --routing --skip-git --skip-install --ssr=false
```

When prompted, accept defaults. This creates `web/` with `package.json`, `angular.json`, `src/`, etc.

- [ ] **Step 2: Install Angular deps**

Run:

```bash
cd web
npm install
cd ..
```

Expected: `web/node_modules/` populated. No errors.

- [ ] **Step 3: Verify dev server starts**

Run: `npm start --prefix web`
Expected: Angular dev server on `http://localhost:4200`, default starter page loads in browser. Stop with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add web/
git commit -m "chore: scaffold Angular 20 workspace"
```

---

## Phase 2: API server

### Task 3: API project setup

**Files:**
- Create: `api/package.json`

- [ ] **Step 1: Create `api/package.json`**

```json
{
  "name": "interview-dashboard-api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "test": "node --test"
  },
  "dependencies": {
    "express": "^4.21.0",
    "cors": "^2.8.5"
  }
}
```

- [ ] **Step 2: Install api deps**

Run: `npm install --prefix api`
Expected: `api/node_modules/` populated.

- [ ] **Step 3: Commit**

```bash
git add api/package.json api/package-lock.json
git commit -m "chore: API project skeleton"
```

---

### Task 4: Seed data

**Files:**
- Create: `api/data/projects.json`
- Create: `api/data/activity.json`

- [ ] **Step 1: Create `api/data/projects.json`**

Distribution: 4 in_progress, 3 completed, 3 overdue, 2 not_started. Five owners shared across projects.

```json
[
  {
    "id": "p_001",
    "name": "Apollo Migration",
    "description": "Migrate legacy auth service to new platform",
    "status": "in_progress",
    "owner": { "id": "u_01", "name": "Sarah Chen", "initials": "SC", "avatarColor": "#5B8DEF" },
    "dueDate": "2026-06-15",
    "progress": 0.65,
    "tasksTotal": 24,
    "tasksDone": 16,
    "tags": ["backend", "infra"]
  },
  {
    "id": "p_002",
    "name": "Customer Portal Redesign",
    "description": "Refresh the self-service portal with new IA",
    "status": "in_progress",
    "owner": { "id": "u_02", "name": "Marcus Reed", "initials": "MR", "avatarColor": "#E36B6B" },
    "dueDate": "2026-05-20",
    "progress": 0.40,
    "tasksTotal": 32,
    "tasksDone": 13,
    "tags": ["frontend", "design"]
  },
  {
    "id": "p_003",
    "name": "Mobile App v2",
    "description": "Native rewrite of the customer mobile app",
    "status": "overdue",
    "owner": { "id": "u_03", "name": "Aisha Patel", "initials": "AP", "avatarColor": "#45A85A" },
    "dueDate": "2026-04-15",
    "progress": 0.78,
    "tasksTotal": 48,
    "tasksDone": 37,
    "tags": ["mobile", "frontend"]
  },
  {
    "id": "p_004",
    "name": "Data Pipeline Refactor",
    "description": "Replace cron pipeline with event-driven architecture",
    "status": "completed",
    "owner": { "id": "u_04", "name": "Tom Williams", "initials": "TW", "avatarColor": "#B16AC4" },
    "dueDate": "2026-03-30",
    "progress": 1.0,
    "tasksTotal": 28,
    "tasksDone": 28,
    "tags": ["backend", "data"]
  },
  {
    "id": "p_005",
    "name": "Analytics Dashboard",
    "description": "Internal dashboard for product metrics",
    "status": "in_progress",
    "owner": { "id": "u_05", "name": "Nina Vasquez", "initials": "NV", "avatarColor": "#E8A33D" },
    "dueDate": "2026-07-01",
    "progress": 0.25,
    "tasksTotal": 20,
    "tasksDone": 5,
    "tags": ["frontend", "data"]
  },
  {
    "id": "p_006",
    "name": "SSO Integration",
    "description": "Add SAML and OIDC support for enterprise customers",
    "status": "completed",
    "owner": { "id": "u_01", "name": "Sarah Chen", "initials": "SC", "avatarColor": "#5B8DEF" },
    "dueDate": "2026-04-01",
    "progress": 1.0,
    "tasksTotal": 18,
    "tasksDone": 18,
    "tags": ["backend", "security"]
  },
  {
    "id": "p_007",
    "name": "Payment Gateway Update",
    "description": "Migrate to new payment provider with 3DS2",
    "status": "overdue",
    "owner": { "id": "u_02", "name": "Marcus Reed", "initials": "MR", "avatarColor": "#E36B6B" },
    "dueDate": "2026-04-20",
    "progress": 0.55,
    "tasksTotal": 22,
    "tasksDone": 12,
    "tags": ["backend", "billing"]
  },
  {
    "id": "p_008",
    "name": "Search Indexing",
    "description": "Move full-text search to Elasticsearch",
    "status": "not_started",
    "owner": { "id": "u_03", "name": "Aisha Patel", "initials": "AP", "avatarColor": "#45A85A" },
    "dueDate": "2026-08-01",
    "progress": 0.0,
    "tasksTotal": 15,
    "tasksDone": 0,
    "tags": ["backend", "search"]
  },
  {
    "id": "p_009",
    "name": "Audit Logging",
    "description": "Centralised, queryable audit log for admin actions",
    "status": "in_progress",
    "owner": { "id": "u_04", "name": "Tom Williams", "initials": "TW", "avatarColor": "#B16AC4" },
    "dueDate": "2026-05-10",
    "progress": 0.50,
    "tasksTotal": 16,
    "tasksDone": 8,
    "tags": ["backend", "compliance"]
  },
  {
    "id": "p_010",
    "name": "Onboarding Flow",
    "description": "New user activation funnel with progressive disclosure",
    "status": "completed",
    "owner": { "id": "u_05", "name": "Nina Vasquez", "initials": "NV", "avatarColor": "#E8A33D" },
    "dueDate": "2026-04-05",
    "progress": 1.0,
    "tasksTotal": 21,
    "tasksDone": 21,
    "tags": ["frontend", "growth"]
  },
  {
    "id": "p_011",
    "name": "Email Notifications",
    "description": "Templated transactional emails with i18n",
    "status": "overdue",
    "owner": { "id": "u_01", "name": "Sarah Chen", "initials": "SC", "avatarColor": "#5B8DEF" },
    "dueDate": "2026-04-10",
    "progress": 0.85,
    "tasksTotal": 14,
    "tasksDone": 12,
    "tags": ["backend", "comms"]
  },
  {
    "id": "p_012",
    "name": "Knowledge Base",
    "description": "Customer-facing help docs platform",
    "status": "not_started",
    "owner": { "id": "u_02", "name": "Marcus Reed", "initials": "MR", "avatarColor": "#E36B6B" },
    "dueDate": "2026-09-01",
    "progress": 0.0,
    "tasksTotal": 30,
    "tasksDone": 0,
    "tags": ["frontend", "content"]
  }
]
```

- [ ] **Step 2: Create `api/data/activity.json`**

20 items, sorted newest-first. Timestamps anchored at 2026-04-29 (today) and spread back across 7 days. Mix of types: `task_completed`, `project_created`, `comment_added`, `status_changed`.

```json
[
  {
    "id": "a_001",
    "type": "task_completed",
    "actor": { "id": "u_01", "name": "Sarah Chen", "initials": "SC" },
    "projectId": "p_001",
    "projectName": "Apollo Migration",
    "message": "completed \"Database schema review\"",
    "timestamp": "2026-04-29T09:32:00Z"
  },
  {
    "id": "a_002",
    "type": "comment_added",
    "actor": { "id": "u_03", "name": "Aisha Patel", "initials": "AP" },
    "projectId": "p_003",
    "projectName": "Mobile App v2",
    "message": "left a comment on \"iOS push notification edge cases\"",
    "timestamp": "2026-04-29T08:14:00Z"
  },
  {
    "id": "a_003",
    "type": "status_changed",
    "actor": { "id": "u_04", "name": "Tom Williams", "initials": "TW" },
    "projectId": "p_004",
    "projectName": "Data Pipeline Refactor",
    "message": "marked the project as completed",
    "timestamp": "2026-04-28T16:48:00Z"
  },
  {
    "id": "a_004",
    "type": "task_completed",
    "actor": { "id": "u_02", "name": "Marcus Reed", "initials": "MR" },
    "projectId": "p_007",
    "projectName": "Payment Gateway Update",
    "message": "completed \"3DS2 integration spike\"",
    "timestamp": "2026-04-28T14:22:00Z"
  },
  {
    "id": "a_005",
    "type": "comment_added",
    "actor": { "id": "u_05", "name": "Nina Vasquez", "initials": "NV" },
    "projectId": "p_005",
    "projectName": "Analytics Dashboard",
    "message": "left a comment on \"Define MVP metrics\"",
    "timestamp": "2026-04-28T11:05:00Z"
  },
  {
    "id": "a_006",
    "type": "task_completed",
    "actor": { "id": "u_01", "name": "Sarah Chen", "initials": "SC" },
    "projectId": "p_006",
    "projectName": "SSO Integration",
    "message": "completed \"Final security review\"",
    "timestamp": "2026-04-27T15:40:00Z"
  },
  {
    "id": "a_007",
    "type": "project_created",
    "actor": { "id": "u_02", "name": "Marcus Reed", "initials": "MR" },
    "projectId": "p_012",
    "projectName": "Knowledge Base",
    "message": "created the project",
    "timestamp": "2026-04-27T10:18:00Z"
  },
  {
    "id": "a_008",
    "type": "task_completed",
    "actor": { "id": "u_03", "name": "Aisha Patel", "initials": "AP" },
    "projectId": "p_003",
    "projectName": "Mobile App v2",
    "message": "completed \"Android release prep\"",
    "timestamp": "2026-04-27T09:51:00Z"
  },
  {
    "id": "a_009",
    "type": "status_changed",
    "actor": { "id": "u_05", "name": "Nina Vasquez", "initials": "NV" },
    "projectId": "p_010",
    "projectName": "Onboarding Flow",
    "message": "marked the project as completed",
    "timestamp": "2026-04-26T17:02:00Z"
  },
  {
    "id": "a_010",
    "type": "comment_added",
    "actor": { "id": "u_04", "name": "Tom Williams", "initials": "TW" },
    "projectId": "p_009",
    "projectName": "Audit Logging",
    "message": "left a comment on \"Retention policy decision\"",
    "timestamp": "2026-04-26T13:29:00Z"
  },
  {
    "id": "a_011",
    "type": "task_completed",
    "actor": { "id": "u_01", "name": "Sarah Chen", "initials": "SC" },
    "projectId": "p_011",
    "projectName": "Email Notifications",
    "message": "completed \"Spanish translations\"",
    "timestamp": "2026-04-26T10:44:00Z"
  },
  {
    "id": "a_012",
    "type": "task_completed",
    "actor": { "id": "u_02", "name": "Marcus Reed", "initials": "MR" },
    "projectId": "p_002",
    "projectName": "Customer Portal Redesign",
    "message": "completed \"Navigation prototype\"",
    "timestamp": "2026-04-25T16:11:00Z"
  },
  {
    "id": "a_013",
    "type": "project_created",
    "actor": { "id": "u_03", "name": "Aisha Patel", "initials": "AP" },
    "projectId": "p_008",
    "projectName": "Search Indexing",
    "message": "created the project",
    "timestamp": "2026-04-25T11:30:00Z"
  },
  {
    "id": "a_014",
    "type": "comment_added",
    "actor": { "id": "u_01", "name": "Sarah Chen", "initials": "SC" },
    "projectId": "p_001",
    "projectName": "Apollo Migration",
    "message": "left a comment on \"Token rotation approach\"",
    "timestamp": "2026-04-25T08:55:00Z"
  },
  {
    "id": "a_015",
    "type": "task_completed",
    "actor": { "id": "u_04", "name": "Tom Williams", "initials": "TW" },
    "projectId": "p_009",
    "projectName": "Audit Logging",
    "message": "completed \"Schema design\"",
    "timestamp": "2026-04-24T17:38:00Z"
  },
  {
    "id": "a_016",
    "type": "status_changed",
    "actor": { "id": "u_02", "name": "Marcus Reed", "initials": "MR" },
    "projectId": "p_007",
    "projectName": "Payment Gateway Update",
    "message": "marked the project as overdue",
    "timestamp": "2026-04-24T12:00:00Z"
  },
  {
    "id": "a_017",
    "type": "comment_added",
    "actor": { "id": "u_05", "name": "Nina Vasquez", "initials": "NV" },
    "projectId": "p_005",
    "projectName": "Analytics Dashboard",
    "message": "left a comment on \"Chart library evaluation\"",
    "timestamp": "2026-04-23T15:46:00Z"
  },
  {
    "id": "a_018",
    "type": "task_completed",
    "actor": { "id": "u_03", "name": "Aisha Patel", "initials": "AP" },
    "projectId": "p_003",
    "projectName": "Mobile App v2",
    "message": "completed \"Tablet layout pass\"",
    "timestamp": "2026-04-23T10:21:00Z"
  },
  {
    "id": "a_019",
    "type": "task_completed",
    "actor": { "id": "u_04", "name": "Tom Williams", "initials": "TW" },
    "projectId": "p_004",
    "projectName": "Data Pipeline Refactor",
    "message": "completed \"Production cutover\"",
    "timestamp": "2026-04-22T14:09:00Z"
  },
  {
    "id": "a_020",
    "type": "comment_added",
    "actor": { "id": "u_01", "name": "Sarah Chen", "initials": "SC" },
    "projectId": "p_011",
    "projectName": "Email Notifications",
    "message": "left a comment on \"German rendering bug\"",
    "timestamp": "2026-04-22T09:33:00Z"
  }
]
```

- [ ] **Step 3: Commit**

```bash
git add api/data/
git commit -m "chore: seed data for projects and activity"
```

---

### Task 5: API smoke tests (red phase)

**Files:**
- Create: `api/server.test.js`

This task writes the tests first (they fail because `server.js` doesn't exist yet). Task 6 implements `server.js` to pass them.

- [ ] **Step 1: Write `api/server.test.js`**

```javascript
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from './server.js';

let server;
const BASE = 'http://localhost:3001';

before(async () => {
  server = await startServer(3001);
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('GET /api/projects returns 200 and an array of 12 projects', async () => {
  const res = await fetch(`${BASE}/api/projects`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body));
  assert.equal(body.length, 12);
});

test('GET /api/projects items have the documented shape', async () => {
  const res = await fetch(`${BASE}/api/projects`);
  const [first] = await res.json();
  assert.ok(typeof first.id === 'string');
  assert.ok(typeof first.name === 'string');
  assert.ok(['not_started', 'in_progress', 'completed', 'overdue'].includes(first.status));
  assert.ok(typeof first.owner.initials === 'string');
  assert.ok(typeof first.owner.avatarColor === 'string');
});

test('GET /api/activity returns 200 and an array of 20 items, newest-first', async () => {
  const res = await fetch(`${BASE}/api/activity`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.length, 20);
  const t0 = new Date(body[0].timestamp).getTime();
  const t1 = new Date(body[1].timestamp).getTime();
  assert.ok(t0 >= t1, 'activity should be sorted newest-first');
});

test('?fail=true returns 500 with an error body', async () => {
  const res = await fetch(`${BASE}/api/projects?fail=true`);
  assert.equal(res.status, 500);
  const body = await res.json();
  assert.equal(body.error, 'Something went wrong');
});

test('?empty=true returns 200 with an empty array', async () => {
  const res = await fetch(`${BASE}/api/activity?empty=true`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body, []);
});

test('responses are delayed by at least 20ms', async () => {
  const t0 = Date.now();
  await fetch(`${BASE}/api/projects`);
  const elapsed = Date.now() - t0;
  assert.ok(elapsed >= 20, `expected delay ≥20ms, got ${elapsed}ms`);
});

test('CORS allows any origin', async () => {
  const res = await fetch(`${BASE}/api/projects`);
  assert.equal(res.headers.get('access-control-allow-origin'), '*');
});
```

- [ ] **Step 2: Run tests, expect failure**

Run: `npm test --prefix api`
Expected: tests fail because `server.js` does not exist yet (`Cannot find module './server.js'`).

- [ ] **Step 3: Commit (red)**

```bash
git add api/server.test.js
git commit -m "test: API smoke + behavioural tests (red)"
```

---

### Task 6: API server implementation (green phase)

**Files:**
- Create: `api/server.js`

- [ ] **Step 1: Write `api/server.js`**

```javascript
import express from 'express';
import cors from 'cors';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function loadJson(name) {
  const raw = await readFile(join(__dirname, 'data', `${name}.json`), 'utf-8');
  return JSON.parse(raw);
}

function delayMiddleware(req, _res, next) {
  const ms = Math.floor(Math.random() * 481) + 20; // 20–500ms
  setTimeout(next, ms);
}

function makeHandler(dataset) {
  return (req, res) => {
    if (req.query.fail === 'true') {
      return res.status(500).json({ error: 'Something went wrong' });
    }
    if (req.query.empty === 'true') {
      return res.json([]);
    }
    res.json(dataset);
  };
}

export async function startServer(port) {
  const projects = await loadJson('projects');
  const activity = await loadJson('activity');
  // Ensure newest-first ordering of activity (defensive — seed data should already be sorted)
  activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const app = express();
  app.use(cors({ origin: '*' }));
  app.use(delayMiddleware);

  app.get('/api/projects', makeHandler(projects));
  app.get('/api/activity', makeHandler(activity));

  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
      resolve(server);
    });
  });
}

// Run when invoked directly (not when imported by tests)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer(3001);
}
```

- [ ] **Step 2: Run tests, expect pass**

Run: `npm test --prefix api`
Expected: all 7 tests pass.

- [ ] **Step 3: Manually verify server boots standalone**

Run: `npm start --prefix api`
Then in another shell: `curl http://localhost:3001/api/projects` — expect a JSON array. Try `curl "http://localhost:3001/api/projects?fail=true" -i` — expect HTTP 500.
Stop with Ctrl+C.

- [ ] **Step 4: Commit (green)**

```bash
git add api/server.js
git commit -m "feat(api): projects + activity endpoints with delay, fail, empty modes"
```

---

## Phase 3: Angular core

### Task 7: Design system tokens in `styles.scss`

**Files:**
- Modify: `web/src/styles.scss`

- [ ] **Step 1: Replace `web/src/styles.scss` with the design system**

```scss
:root {
  // Surfaces
  --bg-app:        #F3F3F3;
  --bg-panel:      #FFFFFF;
  --bg-hover:      #F5F5F5;
  --bg-selected:   #E5F1FB;

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

  // Radius
  --radius-sm: 2px;
  --radius-md: 4px;

  // Shadows
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

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: var(--font-stack);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  background: var(--bg-app);
}

a {
  color: var(--accent);
  text-decoration: none;
  &:hover { color: var(--accent-hover); text-decoration: underline; }
}

h1 { font-size: var(--font-size-xl); margin: 0 0 var(--space-4); }
h2 { font-size: var(--font-size-lg); margin: 0 0 var(--space-3); }
```

- [ ] **Step 2: Commit**

```bash
git add web/src/styles.scss
git commit -m "feat(web): Windows 10 design system tokens"
```

---

### Task 8: TypeScript models

**Files:**
- Create: `web/src/app/core/models.ts`

- [ ] **Step 1: Write `web/src/app/core/models.ts`**

```typescript
export type ProjectStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue';

export interface Owner {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  owner: Owner;
  dueDate: string;        // ISO date (YYYY-MM-DD)
  progress: number;       // 0..1
  tasksTotal: number;
  tasksDone: number;
  tags: string[];
}

export type ActivityType =
  | 'task_completed'
  | 'project_created'
  | 'comment_added'
  | 'status_changed';

export interface Actor {
  id: string;
  name: string;
  initials: string;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  actor: Actor;
  projectId: string;
  projectName: string;
  message: string;
  timestamp: string;      // ISO datetime
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/app/core/models.ts
git commit -m "feat(web): Project and ActivityItem types"
```

---

### Task 9: ApiService tests (red phase)

**Files:**
- Create: `web/src/app/core/api.service.spec.ts`

- [ ] **Step 1: Write `web/src/app/core/api.service.spec.ts`**

```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { Project, ActivityItem } from './models';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getProjects() hits /api/projects and returns the array', (done) => {
    const fake: Project[] = [];
    service.getProjects().subscribe((projects) => {
      expect(projects).toBe(fake);
      done();
    });
    const req = httpMock.expectOne('http://localhost:3001/api/projects');
    expect(req.request.method).toBe('GET');
    req.flush(fake);
  });

  it('getActivity() hits /api/activity and returns the array', (done) => {
    const fake: ActivityItem[] = [];
    service.getActivity().subscribe((items) => {
      expect(items).toBe(fake);
      done();
    });
    const req = httpMock.expectOne('http://localhost:3001/api/activity');
    expect(req.request.method).toBe('GET');
    req.flush(fake);
  });
});
```

- [ ] **Step 2: Run tests, expect failure**

Run: `npm test --prefix web -- --watch=false --browsers=ChromeHeadless`
Expected: tests fail because `ApiService` doesn't exist yet.

- [ ] **Step 3: Commit (red)**

```bash
git add web/src/app/core/api.service.spec.ts
git commit -m "test(web): ApiService unit tests (red)"
```

---

### Task 10: ApiService implementation (green phase)

**Files:**
- Create: `web/src/app/core/api.service.ts`
- Modify: `web/src/app/app.config.ts` (add `provideHttpClient()`)

- [ ] **Step 1: Write `web/src/app/core/api.service.ts`**

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, ActivityItem } from './models';

const API_BASE = 'http://localhost:3001/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${API_BASE}/projects`);
  }

  getActivity(): Observable<ActivityItem[]> {
    return this.http.get<ActivityItem[]>(`${API_BASE}/activity`);
  }
}
```

- [ ] **Step 2: Add `provideHttpClient()` to `web/src/app/app.config.ts`**

Replace the contents of `app.config.ts` with:

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
  ],
};
```

- [ ] **Step 3: Run tests, expect pass**

Run: `npm test --prefix web -- --watch=false --browsers=ChromeHeadless`
Expected: ApiService tests pass.

- [ ] **Step 4: Commit (green)**

```bash
git add web/src/app/core/api.service.ts web/src/app/app.config.ts
git commit -m "feat(web): ApiService for projects and activity"
```

---

## Phase 4: App shell and routes

### Task 11: App routes

**Files:**
- Modify: `web/src/app/app.routes.ts`

- [ ] **Step 1: Replace `web/src/app/app.routes.ts`**

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./features/projects-list/projects-list.component').then(m => m.ProjectsListComponent),
  },
  {
    path: 'instructions',
    loadComponent: () =>
      import('./features/instructions/instructions.component').then(m => m.InstructionsComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  { path: '**', redirectTo: '' },
];
```

- [ ] **Step 2: Commit**

```bash
git add web/src/app/app.routes.ts
git commit -m "feat(web): four-route configuration"
```

---

### Task 12: App shell (top nav + router-outlet)

**Files:**
- Modify: `web/src/app/app.component.ts`
- Modify: `web/src/app/app.component.html`
- Modify: `web/src/app/app.component.scss`

- [ ] **Step 1: Replace `app.component.ts`**

```typescript
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
```

- [ ] **Step 2: Replace `app.component.html`**

```html
<header class="topnav">
  <a class="brand" routerLink="/">Project Tracker</a>
  <nav>
    <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
    <a routerLink="/projects" routerLinkActive="active">Projects</a>
    <a routerLink="/instructions" routerLinkActive="active">Instructions</a>
    <a routerLink="/dashboard" routerLinkActive="active" class="dashboard-link">Dashboard <span class="hint">← Build me</span></a>
  </nav>
</header>

<main class="content">
  <router-outlet />
</main>
```

- [ ] **Step 3: Replace `app.component.scss`**

```scss
.topnav {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  background: var(--accent);
  color: var(--text-on-accent);
  padding: 0 var(--space-5);
  height: 48px;
  box-shadow: var(--shadow-card);

  .brand {
    color: var(--text-on-accent);
    font-weight: 600;
    font-size: var(--font-size-lg);
    text-decoration: none;
  }

  nav {
    display: flex;
    gap: var(--space-2);
    height: 100%;

    a {
      display: flex;
      align-items: center;
      padding: 0 var(--space-4);
      color: var(--text-on-accent);
      opacity: 0.85;
      text-decoration: none;
      border-bottom: 2px solid transparent;

      &:hover { opacity: 1; }
      &.active { opacity: 1; border-bottom-color: var(--text-on-accent); }
    }

    .dashboard-link .hint {
      margin-left: var(--space-2);
      font-size: var(--font-size-sm);
      opacity: 0.85;
    }
  }
}

.content {
  padding: var(--space-5);
  max-width: 1280px;
  margin: 0 auto;
}
```

- [ ] **Step 4: Manually verify the shell renders**

Run: `npm start --prefix web`
Visit `http://localhost:4200`. Expect: Win10-blue top bar with brand + 4 nav links. Clicking each link changes the URL (the routes will currently show errors because feature components don't exist yet — that's fine, fixed in Phase 5). Stop with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add web/src/app/app.component.ts web/src/app/app.component.html web/src/app/app.component.scss
git commit -m "feat(web): top-nav shell with Windows 10 styling"
```

---

## Phase 5: Pre-built routes

### Task 13: Home component

**Files:**
- Create: `web/src/app/features/home/home.component.ts`

- [ ] **Step 1: Write `web/src/app/features/home/home.component.ts`**

```typescript
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <h1>Project Tracker</h1>
      <p class="subtitle">Track your team's projects and recent activity in one place.</p>
      <div class="actions">
        <a routerLink="/dashboard" class="btn primary">Open dashboard</a>
        <a routerLink="/instructions" class="btn secondary">Read interview brief</a>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      max-width: 720px;
      padding: var(--space-6) 0;
    }
    .subtitle {
      color: var(--text-secondary);
      font-size: var(--font-size-lg);
      margin: 0 0 var(--space-5);
    }
    .actions { display: flex; gap: var(--space-3); }
    .btn {
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-size: var(--font-size-base);
      text-decoration: none;
      border: 1px solid transparent;
      cursor: pointer;
    }
    .btn.primary {
      background: var(--accent);
      color: var(--text-on-accent);
      &:hover { background: var(--accent-hover); }
    }
    .btn.secondary {
      background: var(--bg-panel);
      color: var(--text-primary);
      border-color: var(--border-strong);
      &:hover { background: var(--bg-hover); }
    }
  `],
})
export class HomeComponent {}
```

- [ ] **Step 2: Manually verify**

Run `npm start` (root). Visit `/`. Expect: heading, subtitle, two buttons. Primary button is Win10 blue, secondary is white with border.

- [ ] **Step 3: Commit**

```bash
git add web/src/app/features/home/
git commit -m "feat(web): home landing page"
```

---

### Task 14: Projects list component (reference page)

**Files:**
- Create: `web/src/app/features/projects-list/projects-list.component.ts`

This is the page that establishes the codebase patterns the candidate will copy. It must use signals, `inject()`, standalone, and the new control flow. It must look polished — Win10 internal product.

- [ ] **Step 1: Write `web/src/app/features/projects-list/projects-list.component.ts`**

```typescript
import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { Project, ProjectStatus } from '../../core/models';

const STATUS_LABEL: Record<ProjectStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
  overdue: 'Overdue',
};

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [DatePipe],
  template: `
    <h1>Projects</h1>

    @if (loading()) {
      <p class="state">Loading projects…</p>
    } @else if (error()) {
      <p class="state error">Couldn't load projects. {{ error() }}</p>
    } @else {
      <table class="projects">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Owner</th>
            <th>Due</th>
          </tr>
        </thead>
        <tbody>
          @for (p of projects(); track p.id) {
            <tr>
              <td>
                <div class="name">{{ p.name }}</div>
                <div class="desc">{{ p.description }}</div>
              </td>
              <td>
                <span class="status status--{{ p.status }}">{{ statusLabel(p.status) }}</span>
              </td>
              <td>
                <div class="owner">
                  <span class="avatar" [style.background]="p.owner.avatarColor">{{ p.owner.initials }}</span>
                  <span>{{ p.owner.name }}</span>
                </div>
              </td>
              <td>{{ p.dueDate | date:'mediumDate' }}</td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
  styles: [`
    .state {
      color: var(--text-secondary);
      padding: var(--space-4);
      &.error { color: var(--status-overdue); }
    }
    table.projects {
      width: 100%;
      background: var(--bg-panel);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      border-collapse: separate;
      border-spacing: 0;
      overflow: hidden;
    }
    thead th {
      text-align: left;
      padding: var(--space-3) var(--space-4);
      background: var(--bg-app);
      border-bottom: 1px solid var(--border-subtle);
      font-weight: 600;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    tbody tr {
      border-bottom: 1px solid var(--border-subtle);
      &:last-child { border-bottom: 0; }
      &:hover { background: var(--bg-hover); }
    }
    tbody td {
      padding: var(--space-3) var(--space-4);
      vertical-align: middle;
    }
    .name { font-weight: 600; }
    .desc { color: var(--text-muted); font-size: var(--font-size-sm); margin-top: 2px; }
    .status {
      display: inline-block;
      padding: 2px var(--space-2);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--text-on-accent);
    }
    .status--not_started { background: var(--status-not-started); }
    .status--in_progress { background: var(--status-in-progress); }
    .status--completed   { background: var(--status-completed); }
    .status--overdue     { background: var(--status-overdue); }
    .owner { display: flex; align-items: center; gap: var(--space-2); }
    .avatar {
      width: 28px; height: 28px;
      border-radius: 50%;
      color: white;
      font-size: var(--font-size-sm);
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `],
})
export class ProjectsListComponent {
  private readonly api = inject(ApiService);

  readonly projects = signal<Project[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.api.getProjects().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Unknown error');
        this.loading.set(false);
      },
    });
  }

  statusLabel(s: ProjectStatus): string {
    return STATUS_LABEL[s];
  }
}
```

- [ ] **Step 2: Manually verify**

Run `npm start` (root, both processes). Visit `/projects`. Expect:
- Brief loading state then the 12 projects in a clean table.
- Status pills coloured per the design tokens.
- Owner avatars (coloured circles with initials).
- Hover row highlight.
- Visit `/projects?fail=true` (manually edit URL) — expect the red error message. *(The route doesn't accept query strings yet, but the API does — temporarily change `getProjects` URL or use DevTools to verify.)* Skip this verification if too fiddly; the API tests already cover the failure path.

- [ ] **Step 3: Commit**

```bash
git add web/src/app/features/projects-list/
git commit -m "feat(web): projects list reference page (Win10, signals, new control flow)"
```

---

### Task 15: Instructions component (the brief)

**Files:**
- Create: `web/src/app/features/instructions/instructions.component.ts`

- [ ] **Step 1: Write `web/src/app/features/instructions/instructions.component.ts`**

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-instructions',
  standalone: true,
  template: `
    <article class="brief">
      <header>
        <h1>Frontend Interview: Build a Project Dashboard</h1>
        <p class="meta">Estimated time: 60 minutes</p>
      </header>

      <section>
        <h2>Context</h2>
        <p>
          You're building the <code>/dashboard</code> route in this app. The rest of the site
          is already built; treat the existing <a href="/projects">/projects</a> page as a
          reference for the codebase patterns we use (signals, standalone components,
          <code>inject()</code>, the new <code>&#64;if</code>/<code>&#64;for</code> control flow).
        </p>
      </section>

      <section>
        <h2>The brief</h2>

        <h3>Must-have — without these, the build doesn't ship</h3>
        <ol>
          <li><strong>Fetch and display projects.</strong> Call <code>apiService.getProjects()</code>. Render the list (table, card grid — your choice).</li>
          <li><strong>Stat cards row.</strong> Four cards across the top: <em>Total</em>, <em>In progress</em>, <em>Overdue</em>, <em>Completed</em>. Each shows a count derived from the projects data.</li>
          <li><strong>Loading state.</strong> While projects are fetching, show a loading indicator. The API delay varies (20–500ms) — your loading UI should feel intentional under both conditions.</li>
          <li><strong>Error state.</strong> If the API fails (test with <code>?fail=true</code>), show a clear error message. Don't render the dashboard as if it were empty.</li>
        </ol>

        <h3>Should-have — depth and polish</h3>
        <ol start="5">
          <li><strong>Activity feed.</strong> Call <code>apiService.getActivity()</code> and render the recent activity list somewhere on the dashboard. Format timestamps in a friendly way ("2h ago", or another sensible format).</li>
          <li><strong>Responsive layout.</strong> Looks good on a typical desktop (≥1280px) and at 1920×1080 with 125% Windows scaling (effective ~1536×864 — common in our user base). Acceptable down to ~768px. Stat cards stack or wrap; the project list remains usable.</li>
          <li><strong>Visual polish.</strong> Consistent spacing, sensible typography, hover states where appropriate. Status should be visually distinguishable (a coloured badge or pill, not just text). Either work within the existing Windows 10 design system (CSS variables in <code>styles.scss</code>) or deliberately deviate — both are valid; arbitrary styling is not.</li>
        </ol>

        <h3>Nice-to-have — if there's time</h3>
        <ol start="8">
          <li><strong>Filter or sort the project list.</strong> Pick one (status filter, owner filter, sort by due date). Use Angular signals or computed values.</li>
          <li><strong>Empty state.</strong> Test with <code>?empty=true</code>. Show something useful when there are no projects/activity instead of a blank panel.</li>
          <li><strong>Component decomposition.</strong> Break the dashboard into 2–3 smaller components (e.g. <code>StatCard</code>, <code>ProjectListItem</code>, <code>ActivityFeed</code>) rather than one big file.</li>
        </ol>
      </section>

      <section>
        <h2>API reference</h2>

        <h3><code>GET /api/projects</code></h3>
        <p>Returns an array of projects.</p>
<pre><code>{{ projectSample }}</code></pre>
        <p><code>status</code> is one of: <code>"not_started"</code> | <code>"in_progress"</code> | <code>"completed"</code> | <code>"overdue"</code>.</p>

        <h3><code>GET /api/activity</code></h3>
        <p>Returns an array of recent activity, newest first.</p>
<pre><code>{{ activitySample }}</code></pre>
        <p><code>type</code> is one of: <code>"task_completed"</code> | <code>"project_created"</code> | <code>"comment_added"</code> | <code>"status_changed"</code>.</p>

        <h3>Test modes</h3>
        <ul>
          <li><code>?fail=true</code> — returns 500 with <code>&#123; "error": "Something went wrong" &#125;</code>.</li>
          <li><code>?empty=true</code> — returns <code>[]</code>.</li>
        </ul>
        <p>Both endpoints have a 20–500ms artificial delay. Use Chrome DevTools network throttling to verify your loading UI behaves under slower conditions.</p>
      </section>

      <section>
        <h2>What's pre-wired for you</h2>
        <ul>
          <li><code>ApiService</code> in <code>core/api.service.ts</code> with typed methods <code>getProjects()</code> and <code>getActivity()</code>.</li>
          <li><code>Project</code> and <code>ActivityItem</code> types in <code>core/models.ts</code>.</li>
          <li>The <code>/dashboard</code> route is already registered. You only need to fill in <code>features/dashboard/dashboard.component.ts</code>.</li>
        </ul>
      </section>

      <section>
        <h2>Tips</h2>
        <ul>
          <li>Commit when you finish each tier so we can see your progress.</li>
          <li>If you're stuck, talk it through — we're not grading silence.</li>
          <li>Polish matters, but only after Must-have works.</li>
          <li>The laptop's display may not match the test resolutions; resize the browser window to verify.</li>
          <li>The site uses a Windows 10 design system with CSS variables in <code>styles.scss</code>. Use them, extend them, or override them — just be intentional.</li>
        </ul>
      </section>

      <section>
        <h2>What we're looking for</h2>
        <ul>
          <li>Idiomatic Angular 20+.</li>
          <li>Real handling of loading, error, and empty states.</li>
          <li>Visual taste — does the dashboard feel considered?</li>
        </ul>
      </section>

      <p class="signoff">Good luck!</p>
    </article>
  `,
  styles: [`
    .brief {
      max-width: 800px;
      background: var(--bg-panel);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: var(--space-6);
      box-shadow: var(--shadow-card);
    }
    .meta { color: var(--text-secondary); margin: 0 0 var(--space-5); }
    section { margin-bottom: var(--space-6); }
    h2 { margin-top: 0; }
    h3 { font-size: var(--font-size-base); margin: var(--space-4) 0 var(--space-2); }
    code {
      background: var(--bg-app);
      padding: 1px 4px;
      border-radius: var(--radius-sm);
      font-family: Consolas, "Courier New", monospace;
      font-size: 0.9em;
    }
    pre {
      background: var(--bg-app);
      padding: var(--space-3);
      border-radius: var(--radius-md);
      overflow-x: auto;
      font-size: var(--font-size-sm);
    }
    pre code { background: transparent; padding: 0; }
    ol, ul { padding-left: var(--space-5); }
    li { margin-bottom: var(--space-2); }
    .signoff { font-style: italic; color: var(--text-secondary); }
  `],
})
export class InstructionsComponent {
  readonly projectSample = `[
  {
    "id": "p_001",
    "name": "Apollo Migration",
    "description": "Migrate legacy auth service to new platform",
    "status": "in_progress",
    "owner": {
      "id": "u_01",
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
]`;

  readonly activitySample = `[
  {
    "id": "a_001",
    "type": "task_completed",
    "actor": { "id": "u_03", "name": "Sarah Chen", "initials": "SC" },
    "projectId": "p_001",
    "projectName": "Apollo Migration",
    "message": "completed \\"Database schema review\\"",
    "timestamp": "2026-04-29T08:32:00Z"
  }
]`;
}
```

- [ ] **Step 2: Manually verify**

Run `npm start` (root). Visit `/instructions`. Expect: a clean panel with the full brief, code samples in monospace boxes, sectioned headings. Reads like a polished internal doc.

- [ ] **Step 3: Commit**

```bash
git add web/src/app/features/instructions/
git commit -m "feat(web): instructions route with full interview brief"
```

---

## Phase 6: Dashboard stub

### Task 16: Dashboard stub component

**Files:**
- Create: `web/src/app/features/dashboard/dashboard.component.ts`

- [ ] **Step 1: Write `web/src/app/features/dashboard/dashboard.component.ts`**

```typescript
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

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
 *
 * Good luck!
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1>Dashboard</h1>
    <p>This is your canvas. See <a routerLink="/instructions">/instructions</a> for the brief.</p>
  `,
})
export class DashboardComponent {}
```

- [ ] **Step 2: Manually verify**

Run `npm start` (root). Visit `/dashboard`. Expect: a heading and a one-line message linking to instructions. Nothing else.

- [ ] **Step 3: Commit (this is the canonical "empty" state for `npm run reset` to restore to)**

```bash
git add web/src/app/features/dashboard/
git commit -m "feat(web): dashboard stub (canvas for the candidate)"
```

---

## Phase 7: Operational

### Task 17: Interviewer README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# Frontend Interview Dashboard

A local Angular 20 + Express interview tool. Hand the laptop to the candidate, they fill in `/dashboard`. This README is for the **interviewer**, not the candidate.

## Prerequisites

- Node 20+
- A clone of this repo with all dependencies installed (`npm run install:all`)

## The four commands

| Command | When to use |
| --- | --- |
| `npm run install:all` | Once, after cloning. Installs root, `api/`, and `web/` dependencies. |
| `npm start` | Before the candidate sits down. Runs API (port 3001) + Angular dev server (port 4200) concurrently. |
| `npm run reset` | Between candidates. Restores the dashboard stub to its empty state. Idempotent. |
| `npm test` | Run API + ApiService tests. Optional sanity check. |

## Pre-interview checklist

1. `git status` — verify clean working tree.
2. `npm run reset` — restores the stub.
3. `npm start` — wait for both processes to come up. Look for "API listening on http://localhost:3001" and "Application bundle generation complete".
4. Open `http://localhost:4200/instructions` in the browser. This is what the candidate sees first.

Hand over.

## During the interview

The candidate works in `web/src/app/features/dashboard/`. Hot-reload picks up their changes automatically. Encourage them to commit between tiers (`git add . && git commit -m "Must-have done"`) — a tip listed in the brief, not a requirement.

If they crash the dev server: `npm start` in a fresh terminal recovers in seconds.

## After the candidate leaves

1. `git log --oneline` — read commit cadence.
2. `git diff <stub-commit>..HEAD -- web/src/app/features/dashboard/` — see what they actually built. The stub commit is the one with message "feat(web): dashboard stub (canvas for the candidate)".
3. To preserve the artefact: `git branch candidate-<name>-<date>`, then `npm run reset`.

## What to listen for

Three signals, per the spec:

1. **Angular idioms** — signals, standalone components, `inject()`, `@if`/`@for`. The pre-built `/projects` page is the reference for the patterns we use.
2. **Async / HTTP hygiene** — real loading state, real error state, ideally an empty state. The API delay range (20–500ms) tests whether they think about loading flicker.
3. **Visual taste** — do they work within the Windows 10 design system in `styles.scss`, deliberately deviate, or just hack random colours in?

## Troubleshooting

- **Port 3001 or 4200 in use** — run `npx kill-port 3001 4200` or kill the processes manually, then `npm start` again.
- **`npm start` hangs on `web`** — delete `web/.angular/` and `web/node_modules/`, then `npm install --prefix web`.
- **Seed data needs tweaking** — `api/data/projects.json` and `api/data/activity.json`. Restart the API to pick up changes.

## Layout

```
api/                   Express mock API
web/                   Angular 20 SPA
docs/superpowers/      Spec + plan
```

Spec: [`docs/superpowers/specs/2026-04-29-frontend-interview-dashboard-design.md`](docs/superpowers/specs/2026-04-29-frontend-interview-dashboard-design.md)
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: interviewer README"
```

---

## Phase 8: Verification

### Task 18: End-to-end smoke test

This is a manual verification pass, not code. The goal is to confirm the full interviewer + candidate flow works.

- [ ] **Step 1: Verify clean reset works from a "dirty" state**

Manually edit `web/src/app/features/dashboard/dashboard.component.ts` — change the heading to "Dirty". Save.
Then create a new file `web/src/app/features/dashboard/throwaway.ts` containing `export const X = 1;`.

Run: `npm run reset`
Then: `git status`
Expected: working tree clean. Both the edit and the new file are gone.

- [ ] **Step 2: Verify both processes start**

Run: `npm start`
Wait until both processes report ready. Look for:
- API: `API listening on http://localhost:3001`
- Web: `Application bundle generation complete`

Visit each route in the browser:
- `/` — Win10-blue nav bar, hero with two buttons
- `/projects` — table of 12 projects with avatars, status pills, hover states
- `/instructions` — full brief panel
- `/dashboard` — stub heading + link to instructions

Append `?fail=true` to any API URL via the browser dev console (`fetch('http://localhost:3001/api/projects?fail=true').then(r => r.status)`) — expect 500.

Stop with Ctrl+C.

- [ ] **Step 3: Verify tests pass**

Run: `npm test`
Expected: all API tests pass, all ApiService tests pass.

- [ ] **Step 4: Verify candidate flow simulation**

Run `npm run reset && npm start`. Pretend to be the candidate:

1. Open `http://localhost:4200/instructions`. Read the brief.
2. Open `web/src/app/features/dashboard/dashboard.component.ts` in a code editor.
3. Make a trivial change — e.g. add `<p>Hello</p>` to the template.
4. Save and check the browser hot-reloads.

Stop the dev server. Run `npm run reset`. Confirm the file is back to its stub state.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit --allow-empty -m "chore: end-to-end verification complete"
```

---

## Self-review checklist (for the engineer running this plan)

After all tasks pass:

- [ ] All API endpoint behaviours from the spec are implemented (`/projects`, `/activity`, `?fail=true`, `?empty=true`, 20–500ms delay, CORS).
- [ ] All four routes exist and render their pre-built content.
- [ ] The dashboard stub matches the comment block from the spec.
- [ ] The `/projects` reference page uses signals, `inject()`, standalone components, and `@if`/`@for` — no `*ngIf`, no constructor injection.
- [ ] The Win10 design tokens cover everything in the spec's "Visual design system" section.
- [ ] `npm run reset` removes both edits AND new files in the dashboard folder.
- [ ] The README's pre-interview checklist works end-to-end on a freshly cloned repo.
- [ ] No TODOs, placeholder text, or "TBD" in the codebase.

---

## Out of scope

Per the spec, this plan deliberately does NOT include:

- Authentication, user accounts, persistence
- Real charting libraries
- Deployment, Docker, CI
- Automated grading
- Required tests for visual components
- Accessibility audit
- State-management libraries

If any of these come up during execution, push back to the spec — they were excluded for a reason.
