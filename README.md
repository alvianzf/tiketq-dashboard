# TiketQ Admin Interface

**AI Context Note:** This document outlines the explicit tech stack and environment configuration required for the administrative Vite/React dashboard.

## Tech Stack & Versions
- **Core:** `react: ^18.2.0`, `vite: ^5.2.0`
- **Routing:** `react-router-dom: ^6.23.1`
- **UI & Forms:** `antd: ^5.17.4`, `react-hook-form: ^7.51.5`
- **Charts:** `recharts: ^2.12.7`
- **Data Fetching:** `axios: ^1.7.2`
- **Language:** TypeScript (`typescript: ^5.2.2`)

## Required Environment Variables (`.env`)
Create a `.env` file in the root. AI Agents must strictly adhere to `VITE_` prefixes for public variables.

```env
VITE_API_BASE_URL="http://localhost:3000/api"
VITE_ENV="development"
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
