# TiketQ Admin (tiket-admin) — Possible Future Development

This document outlines the detailed roadmap, technical debt resolution checklist, and plan of action for the `tiket-admin` operations dashboard. It serves as a comprehensive reference for future developers to extend administrative capabilities, improve system security, and enhance visual and operational user experience.

---

## Admin Operations Dashboard Engineering Checklist

### Administrative Features

- [~] **Booking detail modal** — A Quick View modal already exists on the Transactions page (`src/pages/Transactions/index.tsx`), showing per-service passenger/route details and status. Still missing: payment timeline and in-modal action buttons (resend email, generate PDF); Cancel/Refund currently live in the row dropdown, not the modal.
- [~] **Booking search & filter** — Live client-side search is implemented on the Transactions table (matches customer name, email, booking code, and `#id`). Still missing: structured filters by service type, date range, and payment status.
- [ ] **Manual email trigger** — Button to resend the e-ticket or booking confirmation email for any transaction. (Note: the old non-functional "Send Receipt" button was removed from the Transactions page; there is no resend/send-receipt endpoint in `adminService`.)
- [ ] **Car rental approval workflow** — Add Accept/Reject actions with a reason field for `PENDING_REVIEW` car rental requests.
- [x] **Analytics/transactions export** — The Transactions page now exports the (filtered) table as a real CSV download, generated client-side via a `Blob`. Exporting analytics chart data / XLSX remains open.
- [ ] **Real-time dashboard** — Use Socket.io's `booking:update` event to update the dashboard stats and transaction list in real time without manual refresh.
- [ ] **Notification system** — In-app toast/bell notification when a new booking or payment is received.
- [ ] **Audit log viewer improvements** — Add filtering, keyword search, and line-level timestamp parsing to the Logs page.

### Dashboard Security & Auth

- [ ] **Re-enable `authMiddleware + adminMiddleware`** — Currently `router.use(authMiddleware, adminMiddleware)` is commented out in `/routes/api/admin/index.js` on the backend. This MUST be uncommented and frontend authorization headers verified before production.
- [ ] **Session timeout** — Automatically log out admin users after a configurable period of inactivity.
- [ ] **Two-factor authentication** — Add TOTP-based 2FA for admin accounts.
- [ ] **Role-based access control (RBAC)** — Differentiate between `super_admin`, `operator`, and `viewer` roles with different permission sets.

### User Interface & Experience (UX)

- [ ] **Dark mode** — The dashboard currently renders in a fixed dark theme (Tailwind + NextUI). Add a light/dark theme toggle to switch layout styling dynamically.
- [ ] **Responsive layout** — Make the admin dashboard usable on tablet screens for on-the-go management.

---

## Infrastructure & Cross-Cutting Features (Admin Relevance)

- [ ] **Unified monorepo tooling** — Set up a Turborepo or Nx workspace at the `/tiketq/` root for shared scripts and dependency management.
- [ ] **Shared TypeScript types package** — Extract shared types (Transaction, Booking, Passenger) into a local `@tiketq/types` package consumable by `tiket-admin`.
- [ ] **Docker Compose for local dev** — Support single `docker-compose.yml` at root to spin up the admin interface alongside postgres, redis, and backend.
