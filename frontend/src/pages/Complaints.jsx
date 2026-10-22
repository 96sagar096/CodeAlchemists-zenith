import { Link } from "react-router-dom"
import { getComplaints } from "../data/mockData"
import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import { API_URL } from "../api/api"

function Complaints() {
  const [complaintList, setComplaintList] = useState([])

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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="officer-complaints p-6 max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">All Operations Complaints</h1>
            <p className="text-slate-500 mt-1">Review, filter, and assign citizen complaints.</p>
          </div>
          <div className="bg-blue-100 text-blue-900 px-4 py-2 rounded-xl text-sm font-bold">
            {list.length} Total Complaints
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Complaint Description</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {list.map((complaint) => {
                  const id = complaint.incidentId || complaint.id || complaint.complaintId
                  const isResolved = String(complaint.status).toUpperCase() === "RESOLVED"
                  return (
                    <tr key={id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-700">
                        #{id}
                      </td>

                      <td className="p-4 font-medium text-slate-900 max-w-sm truncate">
                        {complaint.title || complaint.description}
                      </td>

                      <td className="p-4 text-slate-600">
                        {complaint.category || "General"}
                      </td>

                      <td className="p-4 text-slate-600">
                        {complaint.department || "Municipal Works"}
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            complaint.priority === "HIGH" || complaint.priority === "CRITICAL"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
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

                      <td className="p-4 text-right">
                        <Link
                          to={`/AdminComplaintDetails/${id}`}
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
                        >
                          Manage →
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
