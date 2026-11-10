import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "./components/Layout/RootLayout";
import DashboardPage from "./pages/Dashboard/index";
import TransactionsPage from "./pages/Transactions/index";
import CarRentalPage from "./pages/CarRental/index";
import DestinationsPage from "./pages/Destinations/index";
import HotelsPage from "./pages/Hotels/index";
import ActivitiesPage from "./pages/Activities/index";
import AnalyticsPage from "./pages/Analytics/index";
import UsersPage from "./pages/Users/index";
import ServerManager from "./pages/ServerManager/index";
import LogsPage from "./pages/Logs/index";
import SettingsPage from "./pages/Settings/index";
import LoginPage from "./pages/Login/index";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="car-rental" element={<CarRentalPage />} />
            <Route path="destinations" element={<DestinationsPage />} />
            <Route path="hotels" element={<HotelsPage />} />
            <Route path="activities" element={<ActivitiesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="server" element={<ServerManager />} />
            <Route path="logs" element={<LogsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
