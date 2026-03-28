import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "./components/Layout/RootLayout.tsx";
import DashboardPage from "./pages/Dashboard/index.tsx";
import TransactionsPage from "./pages/Transactions/index.tsx";
import CarRentalPage from "./pages/CarRental/index.tsx";
import AnalyticsPage from "./pages/Analytics/index.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="car-rental" element={<CarRentalPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
