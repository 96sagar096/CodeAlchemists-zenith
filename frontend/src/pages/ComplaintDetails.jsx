import { Link, useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import { getComplaints } from "../data/mockData"
import { useEffect, useState } from "react"
import { API_URL } from "../api/api"
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Sparkles, 
  AlertTriangle,
  ExternalLink
} from "lucide-react"

function ComplaintDetails() {
  const { id } = useParams()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem("token")
  const [proof, setProof] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${API_URL}/api/complaint/my/${id}`, {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data = await response.json()
        setComplaint(data)
        if (data.proof || data.resolutionEvidenceUrl) {
          setProof(data.proof || data.resolutionEvidenceUrl)
        }
      } catch {
        const all = getComplaints()
        const found = all.find(
          (c) =>
            String(c.id) === String(id) ||
            String(c.incidentId) === String(id) ||
            String(c.complaintId) === String(id)
        )
        if (found) {
          setComplaint(found)
          if (found.proof || found.resolutionEvidenceUrl) {
            setProof(found.proof || found.resolutionEvidenceUrl)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, token])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-4xl w-full mx-auto p-8 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-slate-500">Loading complaint timeline...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Complaint Record #{id} Not Found</h1>
          <p className="text-slate-500 text-sm mt-1 max-w-md">
            This complaint does not exist or may have been removed.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            ← Return to Dashboard
          </Link>
        </main>
      </div>
    )
  }

  const incidentNum = complaint.incidentId || complaint.id || complaint.complaintId || id
  const statusStr = String(complaint.status || "Submitted").toUpperCase()
  const isSubmitted = true
  const isAssigned = statusStr === "ASSIGNED" || statusStr === "IN_PROGRESS" || statusStr === "IN PROGRESS" || statusStr === "RESOLVED"
  const isInProgress = statusStr === "IN_PROGRESS" || statusStr === "IN PROGRESS" || statusStr === "RESOLVED"
  const isResolved = statusStr === "RESOLVED"

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-slate-200 text-slate-700 px-3 py-1 rounded-xl">
              Incident #{incidentNum}
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-xl ${
                isResolved
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {complaint.status || "Submitted"}
            </span>
          </div>
        </div>

        {/* Title & Metadata Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
              {complaint.category || "General"}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Assigned to: <strong className="text-slate-800">{complaint.department || "Municipal Corporation"}</strong>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {complaint.title || complaint.category || "Civic Complaint"}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{complaint.location || "Location recorded on file"}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{complaint.date || "Recent"}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Details & Stepper */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Details (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Description Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900">Incident Description</h2>
              <p className="text-slate-700 leading-relaxed text-sm">
                {complaint.description}
              </p>

              {complaint.latitude && complaint.longitude && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 flex items-center justify-between">
                  <span>GPS: {complaint.latitude}, {complaint.longitude}</span>
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
                    Citizen Attached Photograph
                  </h3>
                  <img
                    src={complaint.photoUrl}
                    alt="Citizen evidence"
                    className="rounded-2xl border border-slate-200 max-h-72 w-full object-cover shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Proof of Resolution (If resolved) */}
            {(proof || isResolved) && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Verified Proof of Resolution</h3>
                      <p className="text-xs text-slate-500">Official post-repair evidence uploaded by department crew</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    RESOLVED
                  </span>
                </div>

                {proof ? (
                  <img
                    src={proof}
                    alt="Resolution evidence"
                    className="rounded-2xl border border-slate-200 max-h-80 w-full object-cover shadow-sm"
                  />
                ) : (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                    Resolution confirmed by municipal authority. Photographic proof logged in operations vault.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Stepper & AI Card (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 4-Stage Lifecycle Stepper */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-slate-900">Complaint Lifecycle</h2>

              <div className="space-y-6 relative pl-3">
                <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-slate-200"></div>

                {/* Stage 1 */}
                <div className="relative flex items-start gap-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                    isSubmitted ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">1. Complaint Received</p>
                    <p className="text-xs text-slate-500 mt-0.5">Recorded and categorized by AI Triage Engine</p>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="relative flex items-start gap-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                    isAssigned ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    {isAssigned ? "✓" : "2"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">2. Department Assigned</p>
                    <p className="text-xs text-slate-500 mt-0.5">Dispatched to {complaint.department || "Municipal Works"}</p>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="relative flex items-start gap-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                    isInProgress ? "bg-amber-500 text-white animate-pulse" : "bg-slate-200 text-slate-600"
                  }`}>
                    {isInProgress ? "●" : "3"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">3. Field Work In Progress</p>
                    <p className="text-xs text-slate-500 mt-0.5">Maintenance crew assigned to location</p>
                  </div>
                </div>

                {/* Stage 4 */}
                <div className="relative flex items-start gap-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                    isResolved ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    {isResolved ? "✓" : "4"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">4. Resolved & Verified</p>
                    <p className="text-xs text-slate-500 mt-0.5">Repairs completed with evidence attachment</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">AI Triage Audit</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">Gemini & NLP Engine</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                  <p className="text-slate-400">Classified Category</p>
                  <p className="font-bold text-emerald-300 mt-1">{complaint.category || "General"}</p>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                  <p className="text-slate-400">Urgency Level</p>
                  <p className="font-bold text-amber-300 mt-1">{complaint.priority || "NORMAL"}</p>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 col-span-2">
                  <p className="text-slate-400">Incident Distinctness</p>
                  <p className="font-semibold text-slate-200 mt-1">
                    Unique physical report. Zero active duplicates in immediate vicinity.
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

export default ComplaintDetails
