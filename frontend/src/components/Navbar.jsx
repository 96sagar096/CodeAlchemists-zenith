import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("token1");
    navigate("/login");
  };

  const isOfficer = !!localStorage.getItem("token1");

  return (
    <nav className="site-nav bg-blue-700 text-white px-6 py-4 flex flex-wrap justify-between items-center gap-4 shadow-sm">
      <Link to={isOfficer ? "/officer" : "/dashboard"} className="text-xl font-bold flex items-center gap-2">
        <span className="brand-mark bg-emerald-400 text-slate-900 px-2 py-0.5 rounded font-black text-sm">PN</span>
        <span>Problem Nivaran</span>
        {isOfficer && (
          <span className="text-xs bg-blue-900 text-blue-200 px-2 py-0.5 rounded uppercase tracking-wider font-semibold">
            Officer
          </span>
        )}
      </Link>

      <div className="nav-links flex items-center gap-5 text-sm font-medium">
        {isOfficer ? (
          <>
            <Link to="/officer" className="hover:text-blue-200 transition-colors">
              Officer Dashboard
            </Link>
            <Link to="/officer/complaints" className="hover:text-blue-200 transition-colors">
              All Complaints
            </Link>
            <Link to="/dashboard" className="text-blue-200 hover:text-white transition-colors">
              Citizen View
            </Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className="hover:text-blue-200 transition-colors">
              Dashboard
            </Link>
            <Link to="/submit" className="hover:text-blue-200 transition-colors">
              Submit Complaint
            </Link>
            <Link to="/history" className="hover:text-blue-200 transition-colors">
              History
            </Link>
            <Link to="/officer" className="text-blue-200 hover:text-white transition-colors">
              Officer Portal
            </Link>
          </>
        )}

        <button
          onClick={handleLogout}
          className="bg-blue-800 hover:bg-blue-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
