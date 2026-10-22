import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"


import SubmitComplaint from "./pages/SubmitComplaint"

function App() {

  return (
    <BrowserRouter>

      <Routes>




        <Route
          path="/"
          element={<SubmitComplaint />}
        />

          <Route
              path="submitComplaint"
              element={<SubmitComplaint />}
          />






      </Routes>

    </BrowserRouter>
  )
}

export default App
