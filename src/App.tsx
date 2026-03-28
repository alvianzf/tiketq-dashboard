import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "./components/Layout/RootLayout";
import DashboardPage from "./pages/Dashboard/index";
import TransactionsPage from "./pages/Transactions/index";
import CarRentalPage from "./pages/CarRental/index";
import AnalyticsPage from "./pages/Analytics/index";
import UsersPage from "./pages/Users/index";
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
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
