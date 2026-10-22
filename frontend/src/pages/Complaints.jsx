import { Link } from "react-router-dom"
import { getComplaints } from "../data/mockData"
import { useState, useEffect, useMemo } from "react"
import Navbar from "../components/Navbar"
import { API_URL } from "../api/api"
import { 
  Search, 
  MapPin, 
  ArrowUpRight, 
  ArrowLeft,
  Building2
} from "lucide-react"

function Complaints() {
  const [complaintList, setComplaintList] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDept] = useState("ALL")
  const [selectedStatus, setSelectedStatus] = useState("ALL")

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token1")
        const res = await fetch(`${API_URL}/api/adminInfo/complaints`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (res.ok) {
          const data = await res.json()
          if (data?.complaintResponses && Array.isArray(data.complaintResponses)) {
            setComplaintList(data.complaintResponses)
            return
          }
        }
      } catch (e) {
        console.log("Loading local complaints for officer list", e)
      } finally {
        setComplaintList(getComplaints())
      }
    }
    load()
  }, [])

  const list = complaintList.length > 0 ? complaintList : getComplaints()

  const filtered = useMemo(() => {
    return list.filter((item) => {
      const matchesSearch =
        (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.id || item.incidentId || "").includes(searchTerm)

      const matchesDept =
        selectedDept === "ALL" ||
        (item.department || "").toLowerCase().includes(selectedDept.toLowerCase())

      const s = String(item.status || "").toUpperCase()
      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "RESOLVED" && s === "RESOLVED") ||
        (selectedStatus === "IN_PROGRESS" && s.includes("PROGRESS")) ||
        (selectedStatus === "SUBMITTED" && s === "SUBMITTED")

      return matchesSearch && matchesDept && matchesStatus
    })
  }, [list, searchTerm, selectedDept, selectedStatus])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                to="/officer"
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Command Dashboard</span>
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Municipal Grievance Operations
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Comprehensive registry of all reported infrastructure incidents
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200/80 px-4 py-2 rounded-2xl text-xs font-bold text-blue-900 flex items-center gap-2 shrink-0">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>{list.length} Total Incidents on File</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search */}
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

            {/* Status Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-stretch sm:self-auto justify-center">
              <button
                onClick={() => setSelectedStatus("ALL")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedStatus === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({list.length})
              </button>
              <button
                onClick={() => setSelectedStatus("SUBMITTED")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedStatus === "SUBMITTED" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Submitted
              </button>
              <button
                onClick={() => setSelectedStatus("IN_PROGRESS")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedStatus === "IN_PROGRESS" ? "bg-white text-amber-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setSelectedStatus("RESOLVED")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedStatus === "RESOLVED" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Resolved
              </button>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">Incident Description</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((complaint) => {
                  const id = complaint.incidentId || complaint.id || complaint.complaintId
                  const isResolved = String(complaint.status).toUpperCase() === "RESOLVED"
                  const isCritical = String(complaint.priority).toUpperCase() === "CRITICAL"
                  const isHigh = String(complaint.priority).toUpperCase() === "HIGH" || isCritical

                  return (
                    <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 pl-6 font-mono font-bold text-slate-700">
                        #{id}
                      </td>

                      <td className="p-4 font-medium text-slate-900 max-w-sm">
                        <div className="truncate font-semibold">{complaint.title || complaint.description}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{complaint.location || "Recorded Landmark"}</span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-600">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-xs font-medium">
                          {complaint.category || "General"}
                        </span>
                      </td>

                      <td className="p-4 text-slate-600 text-xs font-medium">
                        {complaint.department || "Municipal Works"}
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            isCritical ? "bg-red-50 text-red-700 border border-red-200" :
                            isHigh ? "bg-orange-50 text-orange-700 border border-orange-200" :
                            "bg-amber-50 text-amber-700 border border-amber-200"
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
                          to={`/AdminComplaintDetails/${id}`}
                          className="inline-flex items-center gap-1 bg-slate-900 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors shadow-sm"
                        >
                          <span>Triage</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Complaints
