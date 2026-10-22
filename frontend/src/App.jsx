import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import SubmitComplaint from "./pages/SubmitComplaint"
import ComplaintHistory from "./pages/ComplaintHistory"
import ComplaintDetails from "./pages/ComplaintDetails"
import OfficerDashboard from "./pages/OfficerDashboard"
import Complaints from "./pages/Complaints"
import OfficerLoginPage from "./pages/OfficerLoginPage"
import AdminComplaintDetails from "./pages/AdminComplaintDetails"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default Landing: Direct to Dashboard if token exists or to Login */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* Citizen Auth */}
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/register"
          element={<Login />}
        />

        {/* Officer Auth */}
        <Route
          path="/officerLogin"
          element={<OfficerLoginPage />}
        />

        {/* Citizen Views */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        <Route
          path="/submit"
          element={<SubmitComplaint />}
        />
        <Route
          path="/submitComplaint"
          element={<SubmitComplaint />}
        />
        <Route
          path="/history"
          element={<ComplaintHistory />}
        />
        <Route
          path="/complaints/:id"
          element={<ComplaintDetails />}
        />

        {/* Officer / Admin Views */}
        <Route
          path="/officer"
          element={<OfficerDashboard />}
        />
        <Route
          path="/officer/complaints"
          element={<Complaints />}
        />
        <Route
          path="/AdminComplaintDetails/:id"
          element={<AdminComplaintDetails />}
        />

        {/* Catch-all fallback */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
