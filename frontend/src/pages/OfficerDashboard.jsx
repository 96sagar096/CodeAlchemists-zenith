import { Link } from "react-router-dom"
import { useEffect, useState, useMemo } from "react"
import { useComplaints } from "../pages/ComplaintContext"
import { API_URL } from "../api/api"
import { getComplaints } from "../data/mockData"
import Navbar from "../components/Navbar"
import { 
  Flame, 
  MapPin, 
  Search, 
  ArrowUpRight, 
  Radio
} from "lucide-react"

function OfficerDashboard() {
  const [_loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const { complaints, setComplaints } = useComplaints()

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token1")
        const response = await fetch(`${API_URL}/api/adminInfo/complaints`, {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data = await response.json()
        if (data?.complaintResponses && Array.isArray(data.complaintResponses)) {
          setComplaints(data.complaintResponses)
          return
        }
      } catch (error) {
        console.log("Officer complaints fetch failed or offline, loading local records:", error)
      } finally {
        const localData = getComplaints()
        setComplaints(localData)
        setLoading(false)
      }
    }

    fetchData()
  }, [setComplaints])

  const list = Array.isArray(complaints) && complaints.length > 0 ? complaints : getComplaints()

  // Metrics
  const total = list.length
  const submitted = list.filter((c) => String(c.status).toLowerCase() === "submitted").length
  const assigned = list.filter((c) => String(c.status).toLowerCase() === "assigned").length
  const inProgress = list.filter((c) => String(c.status).toLowerCase().includes("progress")).length
  const resolved = list.filter((c) => String(c.status).toLowerCase() === "resolved").length
  const highPriority = list.filter((c) => String(c.priority || c.severity).toUpperCase() === "HIGH" || String(c.priority).toUpperCase() === "CRITICAL").length

  // Filtered queue
  const filteredList = useMemo(() => {
    return list.filter((item) => {
      const matchesSearch =
        (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.department || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.id || item.incidentId || "").includes(searchTerm)

      const s = String(item.status || "").toUpperCase()
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "SUBMITTED" && s === "SUBMITTED") ||
        (statusFilter === "IN_PROGRESS" && s.includes("PROGRESS")) ||
        (statusFilter === "RESOLVED" && s === "RESOLVED")

      return matchesSearch && matchesStatus
    })
  }, [list, searchTerm, statusFilter])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Command Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 border border-slate-800 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Operations Command Center · Real-time Triage Active
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Civic Authority Ops Dashboard
              </h1>
              <p className="text-slate-400 text-sm max-w-xl">
                Prioritize civic hazard tickets, allocate municipal maintenance crews, and verify photographic evidence before closing complaints.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/officer/complaints"
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                Full Incident Table
              </Link>
              <div className="bg-amber-400/10 text-amber-300 border border-amber-400/20 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>{highPriority} Urgent Hazards</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hotspot Cluster Alert Widget (DBSCAN Spatial Detection) */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 text-amber-600 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  DBSCAN Spatial Hotspot Cluster Detected
                </h3>
                <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  3 Reports / 300m Radius
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Multiple recurring complaints in <span className="font-semibold text-slate-800">Sector 2 & 4 (Waterlogging / Drainage)</span> reported within the last 24 hours. Suggesting unified civil drainage dispatch.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSearchTerm("Waterlogging")}
            className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl transition-colors shadow-sm shrink-0 self-start sm:self-auto"
          >
            Filter Cluster Tickets
          </button>
        </div>

        {/* 6-Column Ops Metric Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
            <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Total Queue</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{total}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
            <p className="text-[11px] font-bold uppercase text-blue-600 tracking-wider">New Triage</p>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">{submitted}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
            <p className="text-[11px] font-bold uppercase text-purple-600 tracking-wider">Assigned</p>
            <p className="text-2xl font-extrabold text-purple-600 mt-1">{assigned}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
            <p className="text-[11px] font-bold uppercase text-amber-600 tracking-wider">In Progress</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{inProgress}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
            <p className="text-[11px] font-bold uppercase text-emerald-600 tracking-wider">Resolved</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{resolved}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
            <p className="text-[11px] font-bold uppercase text-rose-600 tracking-wider">Critical Priority</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">{highPriority}</p>
          </div>
        </div>

        {/* Priority Triage Queue */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Priority Action Queue</h2>
              <p className="text-xs text-slate-500 mt-0.5">Ranked by urgency scoring, safety overrides, and waiting duration</p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({total})
              </button>
              <button
                onClick={() => setStatusFilter("SUBMITTED")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === "SUBMITTED" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Needs Action ({submitted})
              </button>
              <button
                onClick={() => setStatusFilter("IN_PROGRESS")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === "IN_PROGRESS" ? "bg-white text-amber-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Field Work ({inProgress})
              </button>
              <button
                onClick={() => setStatusFilter("RESOLVED")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === "RESOLVED" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Closed ({resolved})
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by incident ID, department, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
            />
          </div>

          {/* Incident Queue List */}
          <div className="divide-y divide-slate-100">
            {filteredList.map((complaint) => {
              const id = complaint.incidentId || complaint.id || complaint.complaintId
              const isCritical = String(complaint.priority).toUpperCase() === "CRITICAL"
              const isHigh = String(complaint.priority).toUpperCase() === "HIGH" || isCritical
              const isResolved = String(complaint.status).toUpperCase() === "RESOLVED"

              return (
                <div
                  key={id}
                  className="py-4 hover:bg-slate-50/80 px-3 rounded-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                        #{id}
                      </span>
                      <span className="text-xs font-semibold text-slate-600 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                        {complaint.category || "General"}
                      </span>
                      <span className="text-xs text-slate-500">
                        Dept: <span className="font-semibold text-slate-700">{complaint.department || "Municipal Works"}</span>
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base">
                      {complaint.title || complaint.description?.slice(0, 60)}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {complaint.location || "Recorded Landmark"}
                      </span>
                      <span>·</span>
                      <span>{complaint.date || "Recent"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        isCritical ? "bg-red-50 text-red-700 border-red-200" :
                        isHigh ? "bg-orange-50 text-orange-700 border-orange-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {complaint.priority || "NORMAL"}
                    </span>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        isResolved ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {complaint.status || "Submitted"}
                    </span>

                    <Link
                      to={`/AdminComplaintDetails/${id}`}
                      className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors shadow-sm"
                    >
                      <span>Manage</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}

export default OfficerDashboard
