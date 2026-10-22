import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import ComplaintCard from "../components/ComplaintCard"
import { getComplaints } from "../data/mockData"
import { 
  PlusCircle, 
  Search, 
  Layers, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Filter,
  ArrowRight
} from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL

export default function Dashboard() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${API_URL}/api/complaint/my`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!res.ok) throw new Error(`Error: ${res.status}`)
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setComplaints(data)
          return
        }
        setComplaints(getComplaints())
      } catch {
        setComplaints(getComplaints())
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const rawList = Array.isArray(complaints) && complaints.length > 0 ? complaints : getComplaints()

  // Metrics
  const total = rawList.length
  const resolved = rawList.filter((c) => String(c.status).toUpperCase() === "RESOLVED").length
  const inProgress = rawList.filter((c) => String(c.status).toUpperCase().includes("PROGRESS") || String(c.status).toUpperCase() === "ASSIGNED").length
  const highPriority = rawList.filter((c) => String(c.priority || c.severity).toUpperCase() === "HIGH" || String(c.priority).toUpperCase() === "CRITICAL").length

  // Filtered List
  const filteredComplaints = useMemo(() => {
    return rawList.filter((item) => {
      const matchesSearch = 
        (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.id || item.incidentId || "").includes(searchTerm)

      const matchesCategory = 
        selectedCategory === "ALL" || 
        String(item.category || "").toUpperCase().includes(selectedCategory)

      const isResolved = String(item.status).toUpperCase() === "RESOLVED"
      const matchesStatus = 
        statusFilter === "ALL" ||
        (statusFilter === "RESOLVED" && isResolved) ||
        (statusFilter === "ACTIVE" && !isResolved)

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [rawList, searchTerm, selectedCategory, statusFilter])

  const categories = [
    { label: "All Categories", value: "ALL" },
    { label: "Pothole", value: "POTHOLE" },
    { label: "Garbage", value: "GARBAGE" },
    { label: "Water Leakage", value: "WATER" },
    { label: "Streetlight", value: "LIGHT" },
    { label: "Waterlogging", value: "WATERLOG" },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-8 md:p-10 shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                AI-Driven Civic Resolution Platform
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Citizen Grievance Portal
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Report infrastructure hazards with voice speech-to-text, live GPS, and track the end-to-end resolution lifecycle with photographic proof.
              </p>
            </div>

            <Link
              to="/submit"
              className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.03] active:scale-[0.98] shrink-0"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Report New Issue</span>
            </Link>
          </div>
        </div>

        {/* KPI Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Reports</p>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{loading ? "–" : total}</p>
            <p className="text-xs text-slate-500 mt-1">Logged across all wards</p>
          </div>

          {/* In Progress */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Progress</p>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-amber-600 mt-2">{loading ? "–" : inProgress}</p>
            <p className="text-xs text-slate-500 mt-1">Under field inspection</p>
          </div>

          {/* Resolved */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved</p>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-emerald-600 mt-2">{loading ? "–" : resolved}</p>
            <p className="text-xs text-slate-500 mt-1">With proof of work</p>
          </div>

          {/* High Priority */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical / High</p>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-rose-600 mt-2">{loading ? "–" : highPriority}</p>
            <p className="text-xs text-slate-500 mt-1">Urgent safety attention</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, location, or #ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-stretch sm:self-auto justify-center">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({total})
              </button>
              <button
                onClick={() => setStatusFilter("ACTIVE")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === "ACTIVE" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Active ({total - resolved})
              </button>
              <button
                onClick={() => setStatusFilter("RESOLVED")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === "RESOLVED" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Resolved ({resolved})
              </button>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.value
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Your Civic Complaints</span>
              <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                {filteredComplaints.length}
              </span>
            </h2>

            <Link to="/history" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              <span>View tabular history</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse h-48"></div>
              ))}
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No matching complaints found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try clearing your search query or category filters to see more results.
              </p>
              <button
                onClick={() => { setSearchTerm(""); setSelectedCategory("ALL"); setStatusFilter("ALL"); }}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredComplaints.map((c) => (
                <ComplaintCard key={c.id || c.incidentId} complaint={c} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
