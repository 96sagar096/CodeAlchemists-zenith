import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"


import SubmitComplaint from "./pages/SubmitComplaint"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function App() {

  return (
    <BrowserRouter>

      <Routes>




        <Route
          path="/"
          element={<SubmitComplaint />}
        />
          <Route
              path="/login"
              element={<Login/>}
          />
        <Route
            path="/dashBoard"
            element={<Dashboard/>}
        />


          <Route
              path="/submitComplaint"
              element={<SubmitComplaint />}
          />
        <Route
            path="/AdminDashboard"
            element={<AdminDashboard />}
        />






      </Routes>

    </BrowserRouter>
  )
}

export default App
