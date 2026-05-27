# Admin Architecture & Full Service Blueprint

This document describes the complete architecture of the `tiket-admin` Vite + React dashboard used by TiketQ operators. It provides the full `adminService` API method map — every single function call, its HTTP method, its endpoint path, and its TypeScript return type — derived directly from `src/services/api.ts`. It also documents the Axios JWT interceptor logic (how the Bearer token is injected from localStorage and how 401 errors are handled), the authentication flow, the page routing structure, and the strict rule that this repository uses Ant Design exclusively (not NextUI or Tailwind component utilities). Use this document as the definitive reference before adding new pages, API calls, or UI components to the admin panel.

---

## Tech Stack & Rules
- **Framework:** Vite + React 18 + TypeScript
- **UI:** Ant Design (`antd`) — **DO NOT use NextUI or TailwindCSS component utilities here**
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
  serviceType: 'FLIGHT' | 'FERRY' | 'CAR_RENTAL';
  bookingCode: string;
  payment_status: boolean;
  status: string;
  totalSales: string;
  email: string;
  createdAt: string;
  flightBooking: { ... } | null;
  ferryBooking: { ... } | null;
  carRentalRequest: { ... } | null;
}

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
  status: 'Online' | 'Degraded';
  services: { name: string; status: string; latency: string }[];
  system: { cpu: string; memory: string; uptime: string; memPercent: number; cpuPercent: number; }
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
| `Transactions` | `/transactions` | Protected. Renders `antd` Table of all transactions. |
| `Users` | `/users` | Protected + admin only. User CRUD. |
| `CarRental` | `/car-rental` | Protected. Car fleet management with photo uploads. |
| `Analytics` | `/analytics` | Protected. Charts using `recharts`. |
| `Logs` | `/logs` | Protected. Displays raw log string from API. |
| `ServerManager` | `/server` | Protected. PM2 process control + file system browser. |
