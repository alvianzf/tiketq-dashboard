# TiketQ Admin (tiket-admin) — Possible Future Development

This document outlines the detailed roadmap, technical debt resolution checklist, and plan of action for the `tiket-admin` operations dashboard. It serves as a comprehensive reference for future developers to extend administrative capabilities, improve system security, and enhance visual and operational user experience.

---

## Admin Operations Dashboard Engineering Checklist

### Administrative Features

- [ ] **Booking detail modal** — Clicking a transaction row should open a full detail modal with passenger info, payment timeline, and action buttons (resend email, generate PDF, cancel).
- [ ] **Booking search & filter** — Filter by service type, date range, payment status, and customer email on the Transactions table.
- [ ] **Manual email trigger** — Button to resend the e-ticket or booking confirmation email for any transaction.
- [ ] **Car rental approval workflow** — Add Accept/Reject actions with a reason field for `PENDING_REVIEW` car rental requests.
- [ ] **Analytics export** — Export the Transactions table or analytics chart data as CSV/XLSX.
- [ ] **Real-time dashboard** — Use Socket.io's `booking:update` event to update the dashboard stats and transaction list in real time without manual refresh.
- [ ] **Notification system** — In-app toast/bell notification when a new booking or payment is received.
- [ ] **Audit log viewer improvements** — Add filtering, keyword search, and line-level timestamp parsing to the Logs page.

### Dashboard Security & Auth

- [ ] **Re-enable `authMiddleware + adminMiddleware`** — Currently `router.use(authMiddleware, adminMiddleware)` is commented out in `/routes/api/admin/index.js` on the backend. This MUST be uncommented and frontend authorization headers verified before production.
- [ ] **Session timeout** — Automatically log out admin users after a configurable period of inactivity.
- [ ] **Two-factor authentication** — Add TOTP-based 2FA for admin accounts.
- [ ] **Role-based access control (RBAC)** — Differentiate between `super_admin`, `operator`, and `viewer` roles with different permission sets.

### User Interface & Experience (UX)

- [ ] **Dark mode** — Ant Design supports dark theme; add a theme toggle to change layout styling dynamically.
- [ ] **Responsive layout** — Make the admin dashboard usable on tablet screens for on-the-go management.

---

## Infrastructure & Cross-Cutting Features (Admin Relevance)

- [ ] **Unified monorepo tooling** — Set up a Turborepo or Nx workspace at the `/tiketq/` root for shared scripts and dependency management.
- [ ] **Shared TypeScript types package** — Extract shared types (Transaction, Booking, Passenger) into a local `@tiketq/types` package consumable by `tiket-admin`.
- [ ] **Docker Compose for local dev** — Support single `docker-compose.yml` at root to spin up the admin interface alongside postgres, redis, and backend.
