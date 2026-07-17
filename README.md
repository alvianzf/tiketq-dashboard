# TiketQ Admin Interface

The internal operations dashboard for TiketQ, built with Vite, React 19, TypeScript, NextUI v2, and Tailwind CSS v4. Used by staff to monitor transactions, manage the car rental fleet, view system health and logs, control PM2 server processes, and manage admin user accounts. This README provides the exact tech stack versions, required environment variables, and commands needed to set up and run the admin panel locally.

## Tech Stack & Versions
- **Core:** `react: ^19.2.4`, `vite: ^8.0.1`
- **Routing:** `react-router-dom: ^7.13.2`
- **UI:** `@nextui-org/react: ^2.6.11` + `tailwindcss: ^4.2.2` (there is no `antd` dependency)
- **Charts:** `recharts: ^3.8.1`
- **Data Fetching:** `axios: ^1.14.0`, `@tanstack/react-query: ^5.95.2`
- **Language:** TypeScript (`typescript: ~5.9.3`)

## Required Environment Variables (`.env`)
Create a `.env` file in the root. AI Agents must strictly adhere to `VITE_` prefixes for public variables. The only variable read by the app is `VITE_API_URL` (consumed as the Axios `baseURL` in `src/services/api.ts`).

```env
VITE_API_URL="http://localhost:3000/api"
```

## Setup & Execution

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Production Build:**
   ```bash
   npm run build
   ```
   *Generates static files into the `dist/` directory.*
