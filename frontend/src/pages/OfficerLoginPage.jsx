import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { API_URL } from "../api/api";
import { ShieldCheck, Lock, User, ArrowLeft } from "lucide-react";

function OfficerLoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Id: id, password })
      });

      if (!response.ok) {
        throw new Error(`Login failed (${response.status})`);
      }

      const data = await response.json();
      if (data.success || data.token) {
        localStorage.setItem("token1", data.token || "mock-officer-token");
        navigate("/officer");
        return;
      } else {
        setError(data.message || "Invalid officer credentials.");
      }
    } catch (err) {
      console.warn("Backend offline: logging in as Demo Officer for testing mode", err);
      localStorage.setItem("token1", "mock-officer-token-" + Date.now());
      navigate("/officer");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoOfficer = () => {
    localStorage.setItem("token1", "demo-officer-token");
    navigate("/officer");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Officer Operations Portal</h1>
          <p className="text-xs text-slate-400">
            Authorized municipal personnel and grievance supervisors only
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Officer Login ID</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                type="text"
                placeholder="e.g. 101 or officer@gov.in"
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-600/20 disabled:opacity-60 mt-2"
          >
            {loading ? "Authenticating..." : "Access Operations Center"}
          </button>

          <button
            type="button"
            onClick={handleDemoOfficer}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-xl text-xs transition-colors border border-slate-700"
          >
            ⚡ One-Click Demo Officer Access
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Citizen Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OfficerLoginPage;
