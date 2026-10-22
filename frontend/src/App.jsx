import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Login from "./pages/Login"
import CitizenDashboard from "./pages/CitizenDashboard"
import SubmitComplaint from "./pages/SubmitComplaint"
import ComplaintHistory from "./pages/ComplaintHistory"
import ComplaintDetails from "./pages/ComplaintDetails"
import OfficerDashboard from "./pages/OfficerDashboard"
import Complaints from "./pages/Complaints"
import Register from "./pages/Register"
import OfficerLoginPage from "./pages/OfficerLoginPage"
import AdminComplaintDetails from "./pages/AdminComplaintDetails"

function App() {

  return (
    <BrowserRouter>

      <Routes>




        <Route
          path="/"
          element={<Navigate to="/login" />}
        />



        <Route
          path="/dashboard"
          element={<CitizenDashboard />}
        />


      </Routes>

    </BrowserRouter>
  )
}

export default App
