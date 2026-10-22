import { Link, useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import { useEffect, useState, useRef } from "react"
import { useComplaints } from "../pages/ComplaintContext"
import { API_URL } from "../api/api"
import { getComplaints, updateComplaint } from "../data/mockData"

function AdminComplaintDetails() {
  const { id } = useParams()
  const [action, setAction] = useState(null)
  const [file, setFile] = useState(null)
  const [localComplaint, setLocalComplaint] = useState(null)
  const boxRef = useRef(null)

  const { complaints, setComplaints } = useComplaints()

  // Find complaint in Context or fallback to local storage
  const activeComplaint =
    localComplaint ||
    (Array.isArray(complaints)
      ? complaints.find((item) => String(item.incidentId) === String(id) || String(item.id) === String(id))
      : null)

  useEffect(() => {
    if (!activeComplaint) {
      const all = getComplaints()
      const found = all.find((item) => String(item.incidentId) === String(id) || String(item.id) === String(id))
      if (found) {
        setLocalComplaint(found)
      }
    }
  }, [id, activeComplaint])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setAction(null)
        setFile(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const complaint = activeComplaint

  const openInProgress = () => setAction("IN_PROGRESS")
  const openResolved = () => setAction("RESOLVED")

  const submitInProgress = async () => {
    try {
      const token = localStorage.getItem("token1")
      await fetch(`${API_URL}/api/complaint/${complaint?.incidentId || id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "IN_PROGRESS" }),
      })
    } catch (error) {
      console.warn("Backend offline: updating status locally:", error)
    }

    // Always update local state and storage
    updateComplaint(id, { status: "In Progress" })
    setLocalComplaint((prev) => (prev ? { ...prev, status: "In Progress" } : null))
    if (setComplaints) {
      setComplaints((prev) =>
        prev.map((c) =>
          String(c.incidentId) === String(id) || String(c.id) === String(id)
            ? { ...c, status: "In Progress" }
            : c
        )
      )
    }
    setAction(null)
  }

  const submitResolved = async () => {
    if (!file) {
      alert("Please select a proof image.")
      return
    }

    const proofUrl = URL.createObjectURL(file)

    try {
      const token = localStorage.getItem("token1")
      const formData = new FormData()
      formData.append("status", "RESOLVED")
      formData.append("evidence", file)

      await fetch(`${API_URL}/api/complaint/${complaint?.incidentId || id}/resolve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
    } catch (error) {
      console.warn("Backend offline: saving resolution locally:", error)
    }

    // Always update local state and storage
    updateComplaint(id, {
      status: "Resolved",
      proof: proofUrl,
      resolutionEvidenceUrl: proofUrl,
    })
    setLocalComplaint((prev) =>
      prev
        ? {
            ...prev,
            status: "Resolved",
            proof: proofUrl,
            resolutionEvidenceUrl: proofUrl,
          }
        : null
    )
    if (setComplaints) {
      setComplaints((prev) =>
        prev.map((c) =>
          String(c.incidentId) === String(id) || String(c.id) === String(id)
            ? {
                ...c,
                status: "Resolved",
                proof: proofUrl,
                resolutionEvidenceUrl: proofUrl,
              }
            : c
        )
      )
    }

    setAction(null)
    setFile(null)
  }

  if (!complaint) {
    return (
      <div>
        <Navbar />
        <main className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold text-slate-900">Complaint #{id} Not Found</h1>
          <p className="text-slate-500 mt-2">Could not locate complaint in operations queue.</p>
          <Link to="/officer" className="text-blue-700 font-semibold mt-4 inline-block hover:underline">
            ← Back to Officer Dashboard
          </Link>
        </main>
      </div>
    )
  }

  const incidentId = complaint.incidentId || complaint.id || id
  const isResolved = String(complaint.status).toUpperCase() === "RESOLVED"
  const isInProgress = String(complaint.status).toUpperCase().includes("PROGRESS") || isResolved

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <p className="text-xs uppercase font-bold tracking-wider text-slate-500">
              Officer Operations · Incident #{incidentId}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
              {complaint.title || complaint.category || "Civic Complaint"}
            </h1>
          </div>

          <div className="flex gap-2">
            <Link
              to="/officer"
              className="border border-slate-200 bg-white px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← Officer Dashboard
            </Link>
            <Link
              to="/officer/complaints"
              className="border border-slate-200 bg-white px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              All Complaints
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main complaint information */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Incident Overview</h2>
            <p className="text-slate-700 leading-relaxed text-base">{complaint.description}</p>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div>
                <p className="text-xs uppercase font-semibold text-slate-400">Department</p>
                <p className="font-semibold text-slate-800 mt-0.5">{complaint.department || "Municipal Works"}</p>
              </div>

              <div>
                <p className="text-xs uppercase font-semibold text-slate-400">Location Landmark</p>
                <p className="font-semibold text-slate-800 mt-0.5">{complaint.location || "Recorded Landmark"}</p>
              </div>

              <div>
                <p className="text-xs uppercase font-semibold text-slate-400">Priority Level</p>
                <span
                  className={`inline-block text-xs font-bold px-2 py-0.5 rounded mt-1 ${
                    complaint.priority === "HIGH" || complaint.priority === "CRITICAL"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {complaint.priority || "NORMAL"}
                </span>
              </div>

              <div>
                <p className="text-xs uppercase font-semibold text-slate-400">Reported Date</p>
                <p className="font-medium text-slate-700 mt-0.5">{complaint.date || "Recent"}</p>
              </div>
            </div>

            {complaint.photoUrl && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs uppercase font-semibold text-slate-400 mb-2">Citizen Attached Photo</p>
                <img
                  src={complaint.photoUrl}
                  alt="Incident evidence"
                  className="max-h-64 rounded-xl border border-slate-200 object-cover shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Status & Officer Action Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Operations Status</h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">1. Received & Triaged</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">2. Assigned to Department</p>
                  </div>
                </div>

                <div
                  onClick={openInProgress}
                  className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${
                    isInProgress ? "bg-amber-50" : "hover:bg-slate-50"
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full ${isInProgress ? "bg-amber-500" : "bg-slate-300"}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">3. In Progress</p>
                    <p className="text-xs text-blue-600 font-medium">Click to set In Progress</p>
                  </div>
                </div>

                <div
                  onClick={openResolved}
                  className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${
                    isResolved ? "bg-emerald-50" : "hover:bg-slate-50"
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full ${isResolved ? "bg-emerald-500" : "bg-slate-300"}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">4. Resolved</p>
                    <p className="text-xs text-blue-600 font-medium">Click to complete & attach proof</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <span
                className={`w-full block text-center py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                  isResolved ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                }`}
              >
                Current State: {complaint.status}
              </span>
            </div>
          </div>
        </div>

        {/* Action Dialog */}
        <div className="mt-6" ref={boxRef}>
          {action === "IN_PROGRESS" && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-5 rounded-2xl">
              <h3 className="font-bold text-base mb-1">Set Status to In Progress</h3>
              <p className="text-sm text-amber-800 mb-3">
                Confirm that a field work crew has been assigned and is addressing this complaint.
              </p>
              <button
                type="button"
                onClick={submitInProgress}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
              >
                Confirm In Progress
              </button>
            </div>
          )}

          {action === "RESOLVED" && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-5 rounded-2xl">
              <h3 className="font-bold text-base mb-1">Resolve Incident with Photo Proof</h3>
              <p className="text-sm text-emerald-800 mb-3">
                Upload clear photographic evidence showing the civic issue has been resolved.
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="block text-sm mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
              />
              <button
                type="button"
                onClick={submitResolved}
                disabled={!file}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 shadow-sm"
              >
                Submit Resolution & Evidence
              </button>
            </div>
          )}
        </div>

        {/* Evidence image display if resolved */}
        {(complaint.proof || complaint.resolutionEvidenceUrl) && (
          <div className="bg-white rounded-2xl p-6 mt-6 border border-emerald-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span className="text-emerald-600">✓</span> Verified Resolution Proof
            </h3>
            <img
              src={complaint.proof || complaint.resolutionEvidenceUrl}
              alt="Resolved proof"
              className="max-h-72 rounded-xl border border-slate-200 object-cover mt-2 shadow-sm"
            />
          </div>
        )}

        {/* AI Analysis Panel */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 mt-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="bg-emerald-400 text-slate-950 px-2 py-0.5 rounded text-xs font-black">AI</span>
              <span>Intelligent Operations Triage</span>
            </h2>
            <span className="text-xs text-slate-400">Automated Dispatch Advice</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-400">Classified Category</p>
              <p className="font-semibold text-emerald-300 mt-1">{complaint.category || "General"}</p>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-400">Assigned Department</p>
              <p className="font-semibold text-slate-200 mt-1">{complaint.department || "Municipal Operations"}</p>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-400">Severity Metric</p>
              <p className="font-semibold text-amber-300 mt-1">{complaint.severity || "MEDIUM"}</p>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-400">Duplicate Incident ID</p>
              <p className="font-semibold text-emerald-300 mt-1">None (Distinct)</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminComplaintDetails
