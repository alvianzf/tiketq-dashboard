# 00 — Overview

Software Design Document (SDD) for **tiket-admin**, the internal operations dashboard of the TiketQ travel-booking platform.

This document set is grounded entirely in the source code under `/Users/azfaturrahman/Projects/tiketq/tiket-admin/src`. Every statement is verified against the actual implementation; where behaviour is notable or counter-intuitive it is called out explicitly.

---

## 1. Product Purpose

`tiket-admin` is a single-page web application used by TiketQ operations and administration staff to monitor and manage the running TiketQ backend. It is not a customer-facing product; it is the internal control surface for the platform's transactions, inventory, users, and server infrastructure.

The application is a pure browser client. It holds no server logic of its own — all data and all privileged actions are obtained by calling the TiketQ backend REST API (base URL configured via `VITE_API_URL`, see `src/services/api.ts`). Real-time visitor counts on the dashboard arrive over a Socket.io connection derived from the same origin (`src/pages/Dashboard/index.tsx`).

## 2. Scope

In scope (implemented and verified in code):

- Business dashboard with KPIs, revenue/volume charts, live visitor count, system-health panel, and upcoming-schedule pipeline.
- Transaction monitoring and management (client-side search, CSV export, quick-view modal, cancel/refund).
- Analytics view (revenue bar chart, service-distribution pie chart, system-status banner).
- Car-rental fleet inventory CRUD, including multi-photo upload/gallery management.
- Administrative user management (list, create, edit, delete).
- Server / infrastructure management (file browser + editor, PM2 process control, git/npm/prisma operations, raw shell command execution).
- System & audit log viewer.
- Admin login / logout with JWT persisted in `localStorage`.

Out of scope (confirmed absent from the codebase):

- No customer-facing booking flows.
- No test suite (no test runner configured).
- No email/receipt resend feature — there is **no** send-receipt or resend endpoint in `src/services/api.ts`.
- No server-side rendering — this is a Vite SPA served as static assets.

## 3. Users

| User type | Description | How they are distinguished |
|-----------|-------------|----------------------------|
| Administrator | Ops/admin staff who operate the platform. | Authenticated via `/auth/admin-login`; a valid JWT in `localStorage` grants access to every route. |

Authorization is **token-presence only** on the client: `ProtectedRoute` (`src/components/Auth/ProtectedRoute.tsx`) admits any user whose `getMe()` call succeeds. The `User` type carries an `isAdmin` flag (`src/services/AuthService.ts`), but the client does not branch route access on it — it is used only for display. Real enforcement is the backend's responsibility (see `05-AUTH-AND-SECURITY.md`).

## 4. High-Level Capabilities

```mermaid
graph TD
  A[tiket-admin SPA] --> B[Dashboard / Overview]
  A --> C[Transactions]
  A --> D[Analytics]
  A --> E[Car Rental Inventory]
  A --> F[User Management]
  A --> G[Server Manager]
  A --> H[System Logs]
  A --> I[Login]

  B --> J[(TiketQ Backend REST API)]
  C --> J
  D --> J
  E --> J
  F --> J
  G --> J
  H --> J
  B -. Socket.io visitors_update .-> K[(Socket.io origin)]
```

- **Transactions** — view all bookings (flight / ferry / car rental), search, export CSV, quick-view, cancel, refund.
- **Users** — manage administrator accounts.
- **Cars** — manage the rental fleet and its photo galleries.
- **Dashboard / Stats** — revenue and volume KPIs, charts, live visitors, health, upcoming schedules.
- **Server management** — file system browsing/editing, PM2 lifecycle, and infrastructure commands on the backend host.

## 5. Glossary

| Term | Meaning |
|------|---------|
| SPA | Single-page application. The whole UI is one HTML document (`index.html`) bootstrapped by `src/main.tsx`. |
| JWT | JSON Web Token issued by the backend at login, stored in `localStorage` under the key `token`. |
| Service type | The category of a transaction: `FLIGHT`, `FERRY`, or `CAR_RENTAL` (`Transaction.serviceType`). |
| PM2 | Node.js process manager running on the backend host; the Server Manager reads and controls its processes. |
| React Query | `@tanstack/react-query`, the server-state cache used for all data fetching. |
| Quick View | The read-only modal on the Transactions page showing per-service booking detail. |
| `AppResponse<T>` | The backend envelope `{ message, data }`; the service layer unwraps `.data`. |

## 6. Specification Index

| File | Contents |
|------|----------|
| `00-OVERVIEW.md` | This document — purpose, scope, users, capabilities, glossary. |
| `01-ARCHITECTURE.md` | Tech stack, directory map, routing, ProtectedRoute pattern, data-flow diagram. |
| `02-DATA-MODEL.md` | TypeScript interfaces the dashboard consumes (`Transaction`, `Stats`, `Health`, `Car`, `Schedule`, `User`, server shapes). |
| `03-API-SERVICE.md` | The `adminService` method map, the Axios instance, and its interceptors. |
| `04-FEATURES.md` | Per-page feature specification. |
| `05-AUTH-AND-SECURITY.md` | Authentication flow and security posture. |
| `06-DEPLOYMENT.md` | Build, environment variable, and serving model. |
