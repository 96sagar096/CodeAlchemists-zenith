import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { ArrowRight, CheckCircle2, Lock, Mail, User } from "lucide-react"

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
      if (data.success || data.token) {
        localStorage.setItem("token", data.token || "mock-citizen-token")
        navigate("/dashboard")
      } else {
        setError(data.message || "We could not complete your request. Please try again.")
      }
    } catch (err) {
      console.warn("Backend offline: logging in as Demo Citizen for testing mode", err)
      localStorage.setItem("token", "mock-citizen-token-" + Date.now())
      navigate("/dashboard")
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuickDemo = () => {
    localStorage.setItem("token", "demo-citizen-token")
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Intro Banner */}
        <div className="p-8 sm:p-10 bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-blue-500/20">
                PN
              </div>
              <div>
                <span className="font-extrabold text-lg text-white">Problem Nivaran</span>
                <p className="text-[11px] text-emerald-400 font-semibold tracking-wider uppercase">Civic Intelligence</p>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Every civic issue deserves a rapid path to resolution.
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
              Report potholes, garbage accumulation, water leakages, and dark streetlights with real-time AI triage and verified photo evidence.
            </p>
          </div>

          <div className="mt-8 space-y-3 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Voice reporting in 10+ Indian languages</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Automatic duplicate detection & hotspot clustering</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Transparent photo proof of completion</span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="p-8 sm:p-10 bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {mode === "login" ? "Welcome back" : "Create Citizen Account"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {mode === "login" ? "Sign in to track your grievances" : "Join to report issues in your neighborhood"}
                </p>
              </div>

              <div className="bg-slate-800 p-1 rounded-xl flex text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    mode === "login" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    mode === "register" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sagar Burra"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/25 disabled:opacity-60 mt-2"
              >
                {submitting ? "Signing in..." : mode === "login" ? "Sign In to Citizen Portal" : "Create Citizen Account"}
              </button>

              <button
                type="button"
                onClick={handleQuickDemo}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl text-xs transition-colors border border-slate-700"
              >
                ⚡ Explore with Quick Demo Citizen Access
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 mt-6">
            <span>Are you a municipal officer?</span>
            <Link
              to="/officerLogin"
              className="font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Officer Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
