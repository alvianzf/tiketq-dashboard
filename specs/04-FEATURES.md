# 04 — Feature Specification

One subsection per authenticated page, plus the shared layout. Each describes what the page actually does, grounded in its source file.

---

## 1. Layout & Navigation

Files: `src/components/Layout/RootLayout.tsx`, `src/components/Layout/Sidebar.tsx`.

- `RootLayout` renders a fixed `Sidebar` and a scrollable `<main>` containing `<Outlet/>`. On screens below `lg`, the sidebar is off-canvas and toggled by a hamburger button; a backdrop closes it.
- `Sidebar` lists seven navigation links (`/`, `/transactions`, `/car-rental`, `/analytics`, `/users`, `/server`, `/logs`), highlights the active route via `useLocation().pathname`, shows the current user's initial + username, a non-functional "Settings" button, and a "Sign Out" button that calls `logout()` then navigates to `/login`.
- Visual theme is a dark, glassmorphism style (zinc-950 background, translucent cards, blur) applied consistently across all pages via Tailwind utility classes.

---

## 2. Dashboard (`/`)

File: `src/pages/Dashboard/index.tsx`. Data: `useStats()`, plus a direct Socket.io connection.

Contents, top to bottom:

1. **System Health strip** — renders `<SystemHealth/>` (`src/components/SystemHealth.tsx`): four cards showing overall status + per-service latency, CPU load (progress bar, color thresholds 50/80), memory, and uptime. Backed by `useHealth()` which polls every 5 s.
2. **KPI cards (5)** — Online Visitors (real-time), Total Revenue (`Rp` formatted, with `growth` badge), Successful Txns (with computed success-rate string), Total Bookings, Available Cars. Values come from `Stats`; the visitor count comes from the socket.
3. **Revenue Performance** — Recharts `AreaChart` over `Stats.chartData`. Includes decorative "Monthly / Annually" buttons (not wired to data changes).
4. **Transactions Volume** — Recharts `BarChart` over the same `chartData`.
5. **Upcoming Schedules** — renders `<UpcomingSchedules/>`.

### Live visitor counter

An effect opens a Socket.io connection and listens for `visitors_update` (`{ activeVisitors }`). The socket URL is derived from `VITE_API_URL`'s origin (path stripped via `new URL(apiUrl).origin`), with a fallback: if the bundled URL points at localhost but the browser is on a production hostname, it hard-codes `https://api.tiketq.com`. The socket is disconnected on unmount.

### Upcoming Schedules

File: `src/components/UpcomingSchedules/index.tsx`. Data: `useSchedules()`. Partitions `Schedule[]` into three columns by `type` (`FLIGHT` / `FERRY` / `CAR`), each a scrollable card of the next 7 days' confirmed bookings, showing detail, date, and customer name.

---

## 3. Transactions (`/transactions`)

File: `src/pages/Transactions/index.tsx`. Data: `useTransactions()`, `useTransactionMutation()`.

A table of all bookings with the following behaviour:

- **Live client-side search.** A single search input filters the in-memory `Transaction[]` (via `useMemo`) by customer name, email, `bookingCode`, or `#id`. Filtering is instant; no server round-trip. Search is clearable.
- **Customer name resolution.** `getCustomerName()` derives the display name per service type: flight → `flightBooking.name`, ferry → `ferryBooking.mobile_number`, car → `carRentalRequest.fullName`, each falling back to `email`, then `"Guest"`.
- **Status chips.** Colored via `statusColorMap`; `"PENDING"` is relabeled **"Booked"** by `statusLabel()`.
- **CSV export (real, client-side).** The "Export CSV" button runs `handleExport()`: it builds a CSV from the **currently filtered** rows (headers Customer, Email, Type, Date, Amount, Status), properly escapes quotes, creates a `Blob`, and triggers a download of `transactions_report.csv` via an object URL. If there are no rows it shows an error toast. This is a genuine export — not a stub. (The earlier fake/placeholder export was removed.)
- **Quick View modal.** The eye icon opens `<QuickViewModal/>`, a read-only modal rendering service-specific detail: flight (origin/destination + passenger list), ferry (from/to + passenger list), car rental (car name/type/days + rental date + customer). Header shows the booking reference (`bookingCode` or `#id`), status, total amount, and service type.
- **Cancel / Refund dropdown.** The kebab menu offers "Cancel booking" and "Refund booking". Each opens a SweetAlert2 confirmation (`confirmAction`), then calls `cancelTransaction`/`refundTransaction` mutations (which PATCH the backend and invalidate the `transactions` query). Both items are disabled when the ticket is already issued (`isTicketIssued`, flight/ferry only) or the status is already `CANCELLED`/`REFUNDED`; the disabled reason "Ticket already issued" is shown inline.

> Removed features (confirmed absent from code): the old fake/placeholder Export action and the per-row "Send Receipt" button no longer exist — there is no receipt endpoint in `adminService`.

---

## 4. Analytics (`/analytics`)

File: `src/pages/Analytics/index.tsx`. Data: `useStats()`, `useHealth()`.

- **Summary KPI row (3 cards)** — Total Revenue, Successful Transactions, Service Types count (`serviceDistribution.length`).
- **Monthly Revenue** — Recharts `BarChart` over `Stats.chartData`, tooltip formats values as `Rp`. Shows a "No revenue data yet" empty state when `chartData` is empty.
- **Service Distribution** — Recharts `PieChart` (donut) over `Stats.serviceDistribution`, each slice using its own `color`, with a legend. Empty state when no data.
- **System status banner** — green/red banner driven by `Health.status === "Online"`, showing uptime.

---

## 5. Car Rental (`/car-rental`)

File: `src/pages/CarRental/index.tsx`. Data: `useCars()`, `useCarMutation()`.

Full fleet CRUD:

- **Inventory table** — thumbnail (first photo, or an Unsplash placeholder), name + `#id`, type chip, seat rows, price (`Rp` per `pricingDuration`), availability pill, and per-row Edit/Delete actions.
- **Client-side search** by car name; live count of matching vehicles.
- **Add / Edit modal** — a shared modal (non-dismissable by click/keyboard) with local `formState`: name, type (from `carTypes`), price, pricing duration (from `durationTypes`), seat rows, transmission (radio Automatic/Manual), features (checkbox group from `CAR_FEATURES`), and a **ReactQuill** rich-text description editor. Client-side validation rejects empty name/type, non-positive price, and non-positive rows with toasts.
- **Photo gallery management** — inside the modal:
  - Add new photos via hidden file input; previews are shown before upload (object URLs, revoked on removal).
  - On save, the car is created/updated first, then any selected photos are uploaded via `uploadPhotos`.
  - Existing photos can be individually deleted (`deletePhoto`) with confirmation, or multi-selected and bulk-deleted (`deletePhotosBulk`). Local `editingCar.photos` state is updated immediately for responsive feedback.
- **Delete vehicle** — `confirmDelete` dialog then `deleteCar` mutation.

All mutations invalidate the `cars` query on success (`useCarMutation` in `useAdmin.ts`).

---

## 6. Server Manager (`/server`)

File: `src/pages/ServerManager/index.tsx`. Data: direct `adminService` calls (no React Query here); polls PM2 + health every 30 s via `setInterval`.

Titled "Infrastructure Hub". This page performs **infrastructure operations on the backend host** and is the highest-privilege surface in the app. Panels:

- **Active Processes (PM2)** — table of `PM2Process[]` with id/name, status chip, CPU %, memory (MB), and per-row action buttons: **Start** (`pm2-start`), **Restart** (`pm2-restart`), and **Delete** (`pm2-delete`). A "Sync" button re-fetches.
- **System Health** — `ServerHealth` telemetry: CPU load, memory pressure, root disk usage (progress bars with danger thresholds), and uptime.
- **System Navigator (file browser)** — browses the backend filesystem via `getServerFiles(path)`, with breadcrumb navigation and per-file-type icons. Double-click a folder to descend, a file to open it. The current path is persisted to `localStorage` (`tiketq_admin_server_path`) and restored on load. Per-row actions: open/edit, **Move/Rename** (`moveServerFile`, via `prompt`), and **Delete** (`deleteServerFile` for files, or `pm2-delete` if the name matches a process; guarded by a `confirm`).
- **File editor modal** — opens file content in a `<textarea>` with line numbers; "Commit Changes" calls `saveServerFile`. The modal also embeds an ad-hoc "PM2 Name / ID" input + "Quick Restart" that reads the input via `document.querySelector` and fires `pm2-restart`.
- **Maintenance deck** — buttons wired to `executeServerCommand`: Git clone (`git-clone` with a URL input), Git pull (`git-pull`), Git reset (`git-restore`), NPM install (`npm-install`), Deploy build (`npm-build`), Prisma generate (`prisma-generate`), Prisma migrate (`prisma-migrate`).
- **Shell console** — a live log pane accumulating `stdout`/`stderr`/exit-code lines from executed commands, plus a **raw command input** ("Direct Shell Link…") that, on Enter, sends `executeServerCommand("raw", …, { command })` — i.e. arbitrary shell execution on the host.

Every command surfaces `{ stdout, stderr, exitCode }` into the console and a success/failure toast; PM2/git actions trigger a refresh of the relevant panel.

> Security implication: this page can execute arbitrary shell commands and mutate/delete files on the production host. See `05-AUTH-AND-SECURITY.md`.

---

## 7. System Logs (`/logs`)

File: `src/pages/Logs/index.tsx`. Data: `adminService.getLogs()` (raw string).

- Fetches a single raw log blob and splits it into lines.
- **Tab segmentation** — "All Logs", "Process Log", "Audit Stream". Process/audit segmentation keys off marker lines in the text (`SYSTEM BOOT & SERVER PROCESS LOGS`, `TRANSACTION EVENT AUDIT STREAM`).
- **Search filter** across the currently selected segment.
- **Auto-refresh** toggle (5 s `setInterval`) plus a manual Refresh button.
- **Copy** to clipboard and **Export Log** (downloads a `.log` file via Blob, dated filename).
- Line rendering colorizes by content (`[AUDIT]` green, error keywords rose, section headers cyan, success keywords green). Auto-scrolls to the newest line.

---

## 8. Login (`/login`)

File: `src/pages/Login/index.tsx`. See `05-AUTH-AND-SECURITY.md` for the flow.

- Username/password form with password visibility toggle.
- On submit calls `useAuth().login()`; on success shows a welcome toast and navigates to `/`. Errors are surfaced by the Axios interceptor toast.

---

## 9. Cross-Cutting UI Conventions

- **Toasts** — all user feedback uses `sonner` (`toast.success` / `toast.error`), configured once in `src/main.tsx`.
- **Destructive confirmations** — `confirmDelete` / `confirmAction` (SweetAlert2) in `src/utils/swal.ts`. Note the Server Manager also uses native `confirm`/`prompt` in places.
- **Loading** — NextUI `<Spinner/>` and skeleton cards.
- **Formatting** — currency rendered as `Rp {Number(x).toLocaleString('id-ID')}` throughout.
