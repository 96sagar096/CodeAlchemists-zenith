import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API_URL = import.meta.env.VITE_API_URL

function Navbar() {
  const navigate = useNavigate()
  const logout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }
  return (
    <nav className="site-nav">
      <Link to="/dashboard" className="nav-brand">
        <span className="brand-mark">PN</span> Problem Nivaran
      </Link>
      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/submit">Submit Complaint</Link>
        <Link to="/history">History</Link>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}

export default function Dashboard() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${API_URL}/api/complaint/my`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`Error: ${res.status}`)
        setComplaints(await res.json())
      } catch (err) {
        console.log("You have an error:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const total = complaints.length
  const resolved = complaints.filter((c) => c.status === "RESOLVED").length
  const pending = total - resolved
  const high = complaints.filter((c) => c.severity === "HIGH").length

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
            ) : complaints.length === 0 ? (
              <p className="empty">No complaints found.</p>
            ) : (
              complaints.map((c) => (
                <Link key={c.complaintId} to={`/complaints/${c.complaintId}`} className="item">
                  <div>
                    <h3>{c.department}</h3>
                    <p>{c.description}</p>
                    <small>Complaint ID: #{c.complaintId}</small>
                    <small>Created: {new Date(c.createdAt).toLocaleString()}</small>
                  </div>
                  <div className="item-right">
                    <span className={`badge ${c.status === "RESOLVED" ? "badge--done" : "badge--open"}`}>{c.status}</span>
                    <p className={`sev sev--${c.severity}`}>{c.severity}</p>
                    <small>{c.location || "Location not available"}</small>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
