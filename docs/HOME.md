# Admin Architecture & Full Service Blueprint

This document describes the complete architecture of the `tiket-admin` Vite + React dashboard used by TiketQ operators. It provides the full `adminService` API method map — every single function call, its HTTP method, its endpoint path, and its TypeScript return type — derived directly from `src/services/api.ts`. It also documents the Axios JWT interceptor logic (how the Bearer token is injected from localStorage and how 401 errors are handled), the authentication flow, and the page routing structure. Use this document as the definitive reference before adding new pages, API calls, or UI components to the admin panel.

---

## Tech Stack & Rules
- **Framework:** Vite + React 19 + TypeScript
- **UI:** **NextUI v2 (`@nextui-org/react`) + Tailwind v4** (see `src/pages/Transactions/index.tsx`, `src/utils/swal.ts` for SweetAlert confirm dialogs). There is **no `antd` / Ant Design dependency** — any older note calling Ant Design the admin UI library is out of date. Match whatever the page you're editing already uses; don't mix libraries within one page.
- **API layer:** A single Axios instance (`api`) in `src/services/api.ts`
- **State:** React Query (same version as `tiket-FE`)

---

## Axios Instance Configuration (`src/services/api.ts`)

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g. "https://api.tiketq.com/api"
});
```

**Request Interceptor — JWT Injection:**
```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Response Interceptor — Global Error Handling:**
```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.response?.data?.message || "Something went wrong";
    const isCheckAuth = error.config.url === "/auth/me"; // Initial auth check on page load

    if (error.response?.status >= 500) {
      toast.error("Server Error", { description: "The server encountered an internal error." });
    } else if (error.response?.status !== 401 || !isCheckAuth) {
      // 401 on /auth/me is silently swallowed (user simply not logged in yet)
      toast.error("Error", { description: message });
    }

    return Promise.reject(error);
  }
);
```

---

## Complete `adminService` Method Map

All methods return typed data extracted from `AppResponse<T>` wrapper (`{ message: string; data: T }`).

```typescript
// --- Dashboard ---
adminService.getTransactions()        // GET /admin/transactions → Transaction[]
adminService.cancelTransaction(id)    // PATCH /admin/transactions/:id/cancel → Transaction
adminService.refundTransaction(id)    // PATCH /admin/transactions/:id/refund → Transaction
adminService.getStats()               // GET /admin/stats → Stats
adminService.getHealth()              // GET /admin/health → Health
adminService.getUpcomingSchedules()   // GET /admin/upcoming-schedules → Schedule[]
adminService.getLogs()                // GET /admin/logs → string (combined log text)

// --- User Management (requires authMiddleware + adminMiddleware) ---
adminService.getUsers()               // GET /admin/users → AuthUser[]
adminService.registerUser(userData)   // POST /admin/users/register → AuthUser
adminService.updateUser(id, userData) // PUT /admin/users/:id → AuthUser
adminService.deleteUser(id)           // DELETE /admin/users/:id → void

// --- Car Rental Fleet Management ---
adminService.getCars()                            // GET /car-rental/cars → Car[]
adminService.createCar(carData)                   // POST /car-rental/cars → Car
adminService.updateCar(id, carData)               // PUT /car-rental/cars/:id → Car
adminService.deleteCar(id)                        // DELETE /car-rental/cars/:id → void

// --- Car Photos (multipart/form-data) ---
adminService.uploadPhotos(carId, photos: File[])  // POST /car-rental/cars/:id/photos
adminService.deletePhoto(photoId)                 // DELETE /car-rental/photos/:photoId
adminService.deletePhotosBulk(photoIds: number[]) // POST /car-rental/photos/bulk-delete { ids: number[] }

// --- Server Management (PM2 + File System) ---
adminService.getServerFiles(path?)               // GET /admin/server/files?path=
adminService.getFileContent(path)               // GET /admin/server/file?path=
adminService.saveServerFile(path, content)      // POST /admin/server/file/save { path, content }
adminService.moveServerFile(oldPath, newPath)   // POST /admin/server/file/move { oldPath, newPath }
adminService.deleteServerFile(path)             // DELETE /admin/server/file?path=
adminService.getPm2Processes()                  // GET /admin/server/pm2
adminService.getServerHealth()                  // GET /admin/server/health
adminService.executeServerCommand(action, id?, customPath?, extra?)
// POST /admin/server/execute { action, id, customPath, ...extra }
// Used to restart/stop/start PM2 processes
```

---

## Key TypeScript Interfaces (from `src/hooks/useAdmin.ts`)

These are imported by `api.ts` and used as return types:

```typescript
type Transaction = {
  id: number;
  serviceType: string;        // in practice 'FLIGHT' | 'FERRY' | 'CAR_RENTAL'
  bookingCode?: string;
  email: string;
  totalSales: number;
  status: string;
  createdAt: string;
  flightBooking?: { ...; ticketIssued?: boolean };
  ferryBooking?: { ...; ticketIssued?: boolean };
  carRentalRequest?: { ... };  // no ticketIssued — car rentals are always exempt from the cancel/refund block
}
// status: "PENDING" (shown as "Booked") | "PAID" | "CANCELLED" | "REFUNDED"
// Cancel/refund (PATCH .../cancel, .../refund) is blocked with 409 once ticketIssued is true
// for flight/ferry bookings; car rentals are never blocked.

type Stats = {
  totalTransactions: number;
  successfulTransactions: number;
  totalRevenue: number;
  activeCars: number;
  growth: string;           // e.g. "+12.4%" or "N/A"
  chartData: { name: string; total: number }[];
  serviceDistribution: { name: string; value: number; color: string }[];
}

type Health = {
  status: string;             // e.g. 'Online' | 'Degraded'
  services: { name: string; status: string; latency: string }[];
  system: { cpu: string; memory: string; uptime: string; cpuPercent?: number; memPercent?: number; }
}

type Schedule = {
  id: string;              // e.g. "FLIGHT-42", "FERRY-18", "CAR-5"
  type: 'FLIGHT' | 'FERRY' | 'CAR';
  productName: string;
  date: string;            // YYYY-MM-DD
  customerName: string;
  detail: string;          // e.g. "CGK ➔ DPS" or "3 Hari, SUV"
}
```

---

## Page Routes

| Page | Route | Description |
|------|-------|-------------|
| `Login` | `/login` | Unprotected. Calls `POST /api/auth/admin-login`. |
| `Dashboard` | `/` | Protected. Displays `Stats`, `Health`, `Schedule`. |
| `Transactions` | `/transactions` | Protected. NextUI `Table` of all transactions with live client-side search (customer name, email, booking code, `#id`), a real CSV download ("Export CSV", generated client-side via a `Blob`), and a per-row Quick View modal + Cancel/Refund dropdown. |
| `Users` | `/users` | Protected + admin only. User CRUD. |
| `CarRental` | `/car-rental` | Protected. Car fleet management with photo uploads. |
| `Analytics` | `/analytics` | Protected. Charts using `recharts`. |
| `Logs` | `/logs` | Protected. Displays raw log string from API. |
| `ServerManager` | `/server` | Protected. PM2 process control + file system browser. |

---

## Responsive Sidebar Layout

The sidebar is a **slide-in drawer on mobile** and a **permanent fixture on desktop** (`≥ lg / 1024px`).

**Pattern (`RootLayout.tsx` + `Sidebar.tsx`):**
- `RootLayout` holds `sidebarOpen: boolean` state and passes `isOpen` + `onClose` props to `<Sidebar>`.
- A hamburger `<button>` (using `<Menu>` from `lucide-react`) appears in `<main>` only on mobile (`lg:hidden`) and sets `sidebarOpen = true`.
- A semi-transparent backdrop (`fixed inset-0 bg-black/50 z-20 lg:hidden`) renders when open; clicking it calls `onClose`.
- `Sidebar` uses `fixed lg:relative inset-y-0 left-0 z-30` + `transition-transform` + `lg:translate-x-0` / `-translate-x-full` for the slide animation via Tailwind.
- Each nav `<Link>` calls `onClose()` so the drawer closes after navigation on mobile.

**Do not** add a separate mobile nav or top bar — the hamburger-in-main-content pattern is the established approach here.
