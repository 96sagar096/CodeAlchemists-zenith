import Navbar from "../components/Navbar"
import { getComplaints } from "../data/mockData"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { API_URL } from "../api/api";

function ComplaintHistory() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/complaint/my`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setComplaints(data);
            return;
          }
        }
      } catch (e) {
        console.log("Using local complaints history", e);
      } finally {
        setComplaints(getComplaints());
        setLoading(false);
      }
    }
    load();
  }, []);

  const list = Array.isArray(complaints) ? complaints : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Complaint History</h1>
            <p className="text-slate-500 mt-1">Review all your submitted civic reports and their resolution lifecycle.</p>
          </div>
          <Link to="/submit" className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
            + New Complaint
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading history...</div>
          ) : list.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="text-lg font-semibold text-slate-700">No complaints registered yet.</p>
              <Link to="/submit" className="text-blue-700 font-semibold hover:underline mt-2 inline-block">
                Submit your first complaint →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Complaint Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {list.map(complaint => {
                    const id = complaint.id || complaint.incidentId || complaint.complaintId;
                    const isResolved = String(complaint.status).toUpperCase() === "RESOLVED";
                    return (
                      <tr key={id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-700">
                          #{id}
                        </td>
                        <td className="p-4 font-medium text-slate-900 max-w-xs truncate">
                          {complaint.title || complaint.description || "Civic report"}
                        </td>
                        <td className="p-4 text-slate-600">
                          {complaint.category || "General"}
                        </td>
                        <td className="p-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            complaint.priority === "HIGH" || complaint.priority === "CRITICAL"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {complaint.priority || "NORMAL"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            isResolved ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                          }`}>
                            {complaint.status || "Submitted"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            to={`/complaints/${id}`}
                            className="text-blue-700 font-semibold hover:underline"
                          >
                            View Details →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ComplaintHistory;
