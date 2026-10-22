import Navbar from "../components/Navbar"
import { getComplaints } from "../data/mockData"
import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { API_URL } from "../api/api"
import { 
  ArrowLeft, 
  PlusCircle, 
  Search, 
  MapPin, 
  ArrowUpRight, 
  FileText 
} from "lucide-react"

function ComplaintHistory() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${API_URL}/api/complaint/my`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setComplaints(data)
            return
          }
        }
      } catch (e) {
        console.log("Using local complaints history", e)
      } finally {
        setComplaints(getComplaints())
        setLoading(false)
      }
    }
    load()
  }, [])

  const rawList = Array.isArray(complaints) && complaints.length > 0 ? complaints : getComplaints()

  const filtered = useMemo(() => {
    return rawList.filter((item) => {
      const q = searchTerm.toLowerCase()
      return (
        (item.title || "").toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q) ||
        (item.category || "").toLowerCase().includes(q) ||
        (item.location || "").toLowerCase().includes(q) ||
        String(item.id || item.incidentId || "").includes(q)
      )
    })
  }, [rawList, searchTerm])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Complaint History & Records
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Review all your reported civic incidents, track status, and view verified repair evidence.
            </p>
          </div>

          <Link
            to="/submit"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 shrink-0 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Complaint</span>
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, keyword, or landmark..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
            />
          </div>

          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
            Showing {filtered.length} of {rawList.length} grievances
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">Loading history...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">No complaints found</p>
              <p className="text-xs text-slate-400">Try adjusting your search terms</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="p-4 pl-6">ID</th>
                    <th className="p-4">Complaint Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Lifecycle</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((complaint) => {
                    const id = complaint.id || complaint.incidentId || complaint.complaintId
                    const isResolved = String(complaint.status).toUpperCase() === "RESOLVED"
                    const isHigh = String(complaint.priority).toUpperCase() === "HIGH" || String(complaint.priority).toUpperCase() === "CRITICAL"

                    return (
                      <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 pl-6 font-mono font-bold text-slate-700">
                          #{id}
                        </td>

                        <td className="p-4 font-medium text-slate-900 max-w-sm">
                          <div className="truncate font-semibold">{complaint.title || complaint.description}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{complaint.location || "Recorded Location"}</span>
                          </div>
                        </td>

                        <td className="p-4 text-slate-600">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-xs font-medium">
                            {complaint.category || "General"}
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              isHigh ? "bg-red-50 text-red-700 border border-red-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {complaint.priority || "NORMAL"}
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              isResolved ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {complaint.status || "Submitted"}
                          </span>
                        </td>

                        <td className="p-4 pr-6 text-right">
                          <Link
                            to={`/complaints/${id}`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-xs transition-colors"
                          >
                            <span>View Details</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ComplaintHistory
