import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  PlusCircle, 
  Clock3, 
  ShieldCheck, 
  LogOut, 
  Sparkles,
  Building2,
  ChevronRight
} from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("token1");
    navigate("/login");
  };

  const isOfficer = location.pathname.startsWith("/officer") || location.pathname.startsWith("/AdminComplaintDetails");

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/95 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link 
          to={isOfficer ? "/officer" : "/dashboard"} 
          className="flex items-center gap-3 group transition-transform hover:scale-[1.02]"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-blue-500/20">
              PN
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Problem Nivaran
              </span>
              {isOfficer ? (
                <span className="bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  Officer Ops
                </span>
              ) : (
                <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                  Civic AI
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5 font-medium">Smart Civic Grievance & Triage Engine</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-800/60 p-1.5 rounded-2xl border border-slate-700/60 text-sm">
          {isOfficer ? (
            <>
              <Link
                to="/officer"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                  isActive("/officer")
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Operations Command
              </Link>

              <Link
                to="/officer/complaints"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                  isActive("/officer/complaints")
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <Building2 className="w-4 h-4" />
                All Grievances
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                  isActive("/dashboard")
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              <Link
                to="/history"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                  isActive("/history")
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <Clock3 className="w-4 h-4" />
                Track History
              </Link>
            </>
          )}
        </nav>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center gap-3">
          {!isOfficer && (
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Issue</span>
            </Link>
          )}

          {/* Mode Switcher */}
          {isOfficer ? (
            <Link
              to="/dashboard"
              className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-xl transition-colors hidden sm:flex items-center gap-1.5"
            >
              <span>Citizen View</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          ) : (
            <Link
              to="/officer"
              className="text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-950/60 border border-amber-500/30 px-3 py-2 rounded-xl transition-colors hidden sm:flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Officer Ops</span>
            </Link>
          )}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            title="Log out"
            className="text-slate-400 hover:text-rose-400 p-2 rounded-xl hover:bg-slate-800/80 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
