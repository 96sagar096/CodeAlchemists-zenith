import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // localStorage.clear();
    // sessionStorage.clear();
    navigate("/login");
  };
  return (
    <nav className="site-nav bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
      
      <Link to="/dashboard" className="text-xl font-bold">
        <span className="nav-brand-mark">PN</span> Problem Nivaran
      </Link>

      <div className="nav-links flex gap-6">
        <Link to="/dashboard" className="hover:text-blue-200">
          Dashboard
        </Link>

        <Link to="/submit" className="hover:text-blue-200">
          Submit Complaint
        </Link>

        <Link to="/history" className="hover:text-blue-200">
          History
        </Link>

        <button
                onClick={handleLogout}
                className="hover:text-blue-200"
            >
                Logout
          </button>
      </div>

    </nav>
  )
}

export default Navbar
