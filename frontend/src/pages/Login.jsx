import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

// Same env pattern as your project: VITE_API_URL in .env
const API_URL = import.meta.env.VITE_API_URL

export default function Login() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [mode, setMode] = useState(pathname === "/register" ? "register" : "login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const switchMode = (next) => { setMode(next); setError("") }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      const body = mode === "login" ? { email, password } : { name, email, password }
      const res = await fetch(`${API_URL}/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem("token", data.token)
        navigate("/dashboard")
      } else {
        setError(data.message || "We could not complete your request. Please try again.")
      }
    } catch {
      setError("Unable to connect to the service. Please try again shortly.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel auth-panel--intro">
        <div className="brand-mark">PN</div>
        <p className="eyebrow">A better civic experience</p>
        <h1>Every local problem deserves a clear path forward.</h1>
        <p className="auth-intro-copy">Report, follow, and resolve civic concerns from one simple place.</p>
        <div className="auth-features">
          <span>Voice-enabled reporting</span>
          <span>Real-time tracking</span>
          <span>Clear status updates</span>
        </div>
      </section>

      <section className="auth-panel auth-panel--form">
        <div className="auth-card">
          <div className="auth-card-heading">
            <p className="eyebrow">Problem Nivaran</p>
            <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
            <p>{mode === "login" ? "Sign in to track your complaints." : "Join to report issues in your community."}</p>
          </div>

          <div className="auth-tabs" role="tablist">
            <button type="button" className={mode === "login" ? "is-active" : ""} onClick={() => switchMode("login")}>Sign in</button>
            <button type="button" className={mode === "register" ? "is-active" : ""} onClick={() => switchMode("register")}>Register</button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "register" && (
              <label>Full name
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
              </label>
            )}
            <label>Email address
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </label>
            <label>Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <Link to="/officerLogin" className="auth-alt">Login as Admin</Link>
        </div>
      </section>
    </main>
  )
}
