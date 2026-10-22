import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { useComplaints } from "../pages/ComplaintContext"
import { API_URL } from "../api/api"
import { getComplaints } from "../data/mockData"
import Navbar from "../components/Navbar"

function OfficerDashboard() {
  const [loading, setLoading] = useState(true)
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

  const total = list.length
  const submitted = list.filter((c) => String(c.status).toLowerCase() === "submitted").length
  const assigned = list.filter((c) => String(c.status).toLowerCase() === "assigned").length
  const inProgress = list.filter((c) => String(c.status).toLowerCase().includes("progress")).length
  const resolved = list.filter((c) => String(c.status).toLowerCase() === "resolved").length
  const highPriority = list.filter((c) => String(c.priority || c.severity).toUpperCase() === "HIGH" || String(c.priority).toUpperCase() === "CRITICAL").length

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Officer Operations Dashboard</h1>
            <p className="text-slate-500 mt-1">
              Triage, assign, and verify resolution of civic complaints
            </p>
          </div>
          <Link
            to="/officer/complaints"
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            View All Complaints ({total})
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-xs font-semibold uppercase">Total</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{total}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-xs font-semibold uppercase">Submitted</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{submitted}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-xs font-semibold uppercase">Assigned</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{assigned}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-xs font-semibold uppercase">In Progress</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{inProgress}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-xs font-semibold uppercase">Resolved</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{resolved}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-xs font-semibold uppercase">High Priority</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{highPriority}</p>
          </div>
        </div>

        {/* Recent Priority Queue */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Priority Action Queue</h2>
              <p className="text-xs text-slate-500">Sorted by calculated urgency and safety risk</p>
            </div>
            <Link to="/officer/complaints" className="text-blue-700 text-sm font-semibold hover:underline">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading operations queue...</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {list.map((complaint) => {
                const id = complaint.incidentId || complaint.id || complaint.complaintId
                const isHigh = String(complaint.priority).toUpperCase() === "HIGH" || String(complaint.priority).toUpperCase() === "CRITICAL"
                const isResolved = String(complaint.status).toUpperCase() === "RESOLVED"
                return (
                  <Link
                    key={id}
                    to={`/AdminComplaintDetails/${id}`}
                    className="block py-4 px-2 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div className="max-w-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                            #{id}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {complaint.category || "General"} · {complaint.department || "Municipal Works"}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 text-base">
                          {complaint.title || complaint.description?.slice(0, 60)}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          📍 {complaint.location || "Location recorded"}
                        </p>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            isHigh ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
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
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default OfficerDashboard
