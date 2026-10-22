import { Link, useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import { useEffect, useState, useRef } from "react"
import { useComplaints } from "../pages/ComplaintContext"
import { API_URL } from "../api/api"
import { getComplaints, updateComplaint } from "../data/mockData"
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  Wrench, 
  UploadCloud, 
  X,
  Sparkles,
  ExternalLink
} from "lucide-react"

function AdminComplaintDetails() {
  const { id } = useParams()
  const [action, setAction] = useState(null)
  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
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
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const complaint = activeComplaint

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setFilePreview(URL.createObjectURL(selected))
    }
  }

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
    if (!file && !filePreview) {
      alert("Please upload an image as proof of resolution.")
      return
    }

    const proofUrl = filePreview || (file ? URL.createObjectURL(file) : null)

    try {
      const token = localStorage.getItem("token1")
      const formData = new FormData()
      formData.append("status", "RESOLVED")
      if (file) formData.append("evidence", file)

      await fetch(`${API_URL}/api/complaint/${complaint?.incidentId || id}/resolve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
    } catch (error) {
      console.warn("Backend offline: saving resolution locally:", error)
    }

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
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Incident #{id} Not Found in Operations</h1>
          <p className="text-slate-500 text-sm mt-1 max-w-md">
            This complaint does not exist in the active officer triage queue.
          </p>
          <Link
            to="/officer"
            className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            ← Back to Operations Command
          </Link>
        </main>
      </div>
    )
  }

  const incidentId = complaint.incidentId || complaint.id || id
  const isResolved = String(complaint.status).toUpperCase() === "RESOLVED"

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/officer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Operations Queue</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold bg-slate-200 text-slate-700 px-3 py-1 rounded-xl">
              Incident #{incidentId}
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-xl ${
                isResolved ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
              }`}
            >
              Status: {complaint.status}
            </span>
          </div>
        </div>

        {/* Title & Metadata Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
              Priority: {complaint.priority || "NORMAL"}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Department: <strong className="text-slate-800">{complaint.department || "Municipal Operations"}</strong>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {complaint.title || complaint.category || "Civic Complaint"}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{complaint.location || "Recorded Landmark"}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Logged: {complaint.date || "Recent"}</span>
            </div>
          </div>
        </div>

        {/* 2-Column: Details and Officer Action Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Incident Details (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900">Citizen Report Details</h2>
              <p className="text-slate-700 leading-relaxed text-sm">{complaint.description}</p>

              {complaint.latitude && complaint.longitude && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 flex items-center justify-between">
                  <span>GPS Coordinates: {complaint.latitude}, {complaint.longitude}</span>
                  <a
                    href={`https://maps.google.com/?q=${complaint.latitude},${complaint.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>Open Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {complaint.photoUrl && (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Citizen Photo Evidence
                  </h3>
                  <img
                    src={complaint.photoUrl}
                    alt="Citizen report"
                    className="rounded-2xl border border-slate-200 max-h-72 w-full object-cover shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Resolved Proof if already completed */}
            {(complaint.proof || complaint.resolutionEvidenceUrl) && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Resolution Proof On Record</h3>
                    <p className="text-xs text-slate-500">Photographic evidence submitted by field crew</p>
                  </div>
                </div>

                <img
                  src={complaint.proof || complaint.resolutionEvidenceUrl}
                  alt="Resolved proof"
                  className="rounded-2xl border border-slate-200 max-h-80 w-full object-cover shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Right: Officer Action Controls (5 Columns) */}
          <div className="lg:col-span-5 space-y-6" ref={boxRef}>
            
            {/* Action Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Officer Action Panel</h2>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Update operational status or upload verified completion evidence to resolve ticket.
              </p>

              <div className="space-y-3 pt-2">
                {/* Mark In Progress */}
                <button
                  type="button"
                  onClick={() => setAction("IN_PROGRESS")}
                  disabled={isResolved}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    action === "IN_PROGRESS"
                      ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20"
                      : "border-slate-200 hover:border-amber-300 hover:bg-slate-50"
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">1. Dispatch Field Crew</span>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-lg">
                      In Progress
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Mark that a repair team has arrived on site.
                  </p>
                </button>

                {/* Mark Resolved */}
                <button
                  type="button"
                  onClick={() => setAction("RESOLVED")}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    action === "RESOLVED"
                      ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                      : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">2. Complete & Attach Proof</span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                      Resolve
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload official post-repair photo and mark resolved.
                  </p>
                </button>
              </div>

              {/* Action Confirm Form */}
              {action === "IN_PROGRESS" && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 animate-fadeIn">
                  <p className="text-xs text-amber-900 font-semibold">
                    Confirm field team assignment for this incident?
                  </p>
                  <button
                    type="button"
                    onClick={submitInProgress}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                  >
                    Set Status to In Progress
                  </button>
                </div>
              )}

              {action === "RESOLVED" && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 animate-fadeIn">
                  <p className="text-xs text-emerald-900 font-semibold">
                    Upload Photographic Proof of Resolution:
                  </p>

                  {filePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-emerald-300">
                      <img src={filePreview} alt="Preview" className="w-full h-36 object-cover" />
                      <button
                        type="button"
                        onClick={() => { setFile(null); setFilePreview(null); }}
                        className="absolute top-2 right-2 p-1 bg-slate-900/80 text-white rounded-lg"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors">
                      <UploadCloud className="w-6 h-6 text-emerald-600 mb-1" />
                      <span className="text-xs font-bold text-emerald-800">Select Proof Photograph</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}

                  <button
                    type="button"
                    onClick={submitResolved}
                    disabled={!file && !filePreview}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    Confirm Resolution & Close Ticket
                  </button>
                </div>
              )}
            </div>

            {/* AI Operations Triage Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">AI Resource Recommendation</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">Gemini Engine</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                  <p className="text-slate-400">Recommended Dispatch Team</p>
                  <p className="font-bold text-emerald-300 mt-0.5">{complaint.department || "Municipal Fast Response Crew"}</p>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                  <p className="text-slate-400">Suggested Equipment & Vehicles</p>
                  <p className="font-semibold text-slate-200 mt-0.5">
                    {complaint.category === "Pothole" ? "Cold mix asphalt, roller compactor, traffic cones" :
                     complaint.category === "Waterlogging" ? "De-watering suction pumps, silt clearing tools" :
                     complaint.category === "Water Leakage" ? "Excavator, pipe clamps, replacement valves" :
                     complaint.category === "Streetlight" ? "Hydraulic cherry-picker truck, LED luminaire units" :
                     "Standard municipal maintenance utility kit"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminComplaintDetails
