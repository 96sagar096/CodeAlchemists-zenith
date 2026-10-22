import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import { getComplaints } from "../data/mockData"

const API_URL = import.meta.env.VITE_API_URL

export default function Dashboard() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

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
      } catch (err) {
        console.log("Backend offline or request failed, using local data:", err)
        setComplaints(getComplaints())
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const list = Array.isArray(complaints) ? complaints : []
  const total = list.length
  const resolved = list.filter((c) => String(c.status).toUpperCase() === "RESOLVED").length
  const pending = total - resolved
  const high = list.filter((c) => String(c.severity || c.priority).toUpperCase() === "HIGH" || String(c.priority).toUpperCase() === "CRITICAL").length

  const stats = [
    ["Total Complaints", total],
    ["Pending", pending],
    ["Resolved", resolved],
    ["High Priority", high],
  ]

  return (
    <div>
      <Navbar />
      <main className="page">
        <h1>Citizen Dashboard</h1>
        <p className="page-sub">Track and manage your civic complaints</p>

        <div className="stats">
          {stats.map(([label, value]) => (
            <div key={label} className="card stat">
              <p className="stat-label">{label}</p>
              <h2 className="stat-value">{loading ? "–" : value}</h2>
            </div>
          ))}
        </div>

        <div className="card panel">
          <div className="panel-head">
            <h2>Recent Complaints</h2>
            <Link to="/submit" className="btn">+ New Complaint</Link>
          </div>

          <div className="list">
            {loading ? (
              <p className="empty">Loading...</p>
            ) : list.length === 0 ? (
              <p className="empty">No complaints found.</p>
            ) : (
              list.map((c) => {
                const id = c.complaintId || c.incidentId || c.id
                const isResolved = String(c.status).toUpperCase() === "RESOLVED"
                return (
                  <Link key={id} to={`/complaints/${id}`} className="item">
                    <div>
                      <h3>{c.title || c.department || c.category}</h3>
                      <p>{c.description}</p>
                      <small>Complaint ID: #{id}</small>
                      <small>Created: {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : c.date || "Recent"}</small>
                    </div>
                    <div className="item-right">
                      <span className={`badge ${isResolved ? "badge--done" : "badge--open"}`}>{c.status}</span>
                      <p className={`sev sev--${c.severity || c.priority}`}>{c.priority || c.severity}</p>
                      <small>{c.location || "Location not available"}</small>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
