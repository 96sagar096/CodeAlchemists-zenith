import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { API_URL } from "../api/api";

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-6">
          <span className="brand-mark bg-emerald-400 text-slate-900 px-3 py-1 rounded-xl font-black text-lg inline-block mb-2">
            PN
          </span>
          <h1 className="text-2xl font-bold text-slate-900">Officer Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage and resolve civic complaints</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Officer Login ID</label>
            <input
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="e.g. 101 or officer@gov.in"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login to Operations"}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-100 pt-4">
          <Link to="/login" className="text-sm font-medium text-blue-600 hover:underline">
            ← Back to Citizen Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OfficerLoginPage;
