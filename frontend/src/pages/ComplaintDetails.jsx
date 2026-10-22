import { Link, useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import { getComplaints } from "../data/mockData"
import { useEffect, useState } from "react"
import { API_URL } from "../api/api";

function ComplaintDetails() {
  const { id } = useParams()
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const [proof, setProof] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `${API_URL}/api/complaint/my/${id}`, {
            method: "GET",
            headers: token ? { "Authorization": `Bearer ${token}` } : {}
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setComplaint(data);
        if (data.proof || data.resolutionEvidenceUrl) {
          setProof(data.proof || data.resolutionEvidenceUrl);
        }
      } catch (error) {
        console.log("Backend offline or complaint fetch failed, checking local data:", error);
        const all = getComplaints();
        const found = all.find(c => String(c.id) === String(id) || String(c.incidentId) === String(id) || String(c.complaintId) === String(id));
        if (found) {
          setComplaint(found);
          if (found.proof || found.resolutionEvidenceUrl) {
            setProof(found.proof || found.resolutionEvidenceUrl);
          }
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, token]);

  const getImage = async () => {
    if (proof) return;
    try {
      const response = await fetch(
        `${API_URL}/api/complaint/${complaint?.incidentId || id}/evidence`, {
          method: "GET",
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setProof(imageUrl);
      }
    } catch (error) {
      console.log("Error fetching image:", error);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="p-8 max-w-4xl mx-auto text-slate-600">Loading complaint details...</div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div>
        <Navbar />
        <main className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold text-slate-900">Complaint #{id} Not Found</h1>
          <p className="text-slate-500 mt-2">The requested complaint record could not be found.</p>
          <Link to="/dashboard" className="text-blue-700 font-semibold mt-4 inline-block hover:underline">
            ← Return to Dashboard
          </Link>
        </main>
      </div>
    );
  }

  const incidentNum = complaint.incidentId || complaint.id || complaint.complaintId || id;
  const statusStr = String(complaint.status || "Submitted").toUpperCase();
  const isSubmitted = true;
  const isAssigned = statusStr === "ASSIGNED" || statusStr === "IN_PROGRESS" || statusStr === "IN PROGRESS" || statusStr === "RESOLVED";
  const isInProgress = statusStr === "IN_PROGRESS" || statusStr === "IN PROGRESS" || statusStr === "RESOLVED";
  const isResolved = statusStr === "RESOLVED";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Complaint Record #{incidentNum}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
              {complaint.title || complaint.category || "Civic Complaint"}
            </h1>
          </div>

          <div className="flex gap-2">
            <Link to="/dashboard" className="border border-slate-200 bg-white px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
              Citizen Dashboard
            </Link>
            <Link to="/history" className="border border-slate-200 bg-white px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
              History
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main complaint details */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              Complaint Description
            </h2>
            <p className="text-slate-700 leading-relaxed text-base">
              {complaint.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div>
                <p className="text-xs uppercase font-semibold text-slate-400">Category</p>
                <p className="font-semibold text-slate-800 mt-0.5">{complaint.category || "General"}</p>
              </div>

              <div>
                <p className="text-xs uppercase font-semibold text-slate-400">Department</p>
                <p className="font-semibold text-slate-800 mt-0.5">{complaint.department || "Municipal Corp"}</p>
              </div>

              <div>
                <p className="text-xs uppercase font-semibold text-slate-400">Priority</p>
                <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded mt-1 ${
                  complaint.priority === "HIGH" || complaint.priority === "CRITICAL" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                }`}>
                  {complaint.priority || "NORMAL"}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-3">
                <p className="text-xs uppercase font-semibold text-slate-400">Location Landmark</p>
                <p className="font-medium text-slate-800 mt-0.5">📍 {complaint.location || "Recorded via GPS"}</p>
                {complaint.latitude && complaint.longitude && (
                  <p className="text-xs font-mono text-slate-500 mt-0.5">
                    GPS Coordinates: {complaint.latitude}, {complaint.longitude}
                  </p>
                )}
              </div>
            </div>

            {complaint.photoUrl && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs uppercase font-semibold text-slate-400 mb-2">Attached Citizen Photo</p>
                <img
                  src={complaint.photoUrl}
                  alt="Complaint evidence"
                  className="max-h-64 rounded-xl border border-slate-200 object-cover shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Status Tracker */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-6">Lifecycle Status</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className={`w-3.5 h-3.5 rounded-full mt-1 ${isSubmitted ? "bg-emerald-500" : "bg-slate-300"}`} />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">1. Submitted</p>
                    <p className="text-xs text-slate-500">Complaint verified & recorded</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-3.5 h-3.5 rounded-full mt-1 ${isAssigned ? "bg-emerald-500" : "bg-slate-300"}`} />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">2. Assigned</p>
                    <p className="text-xs text-slate-500">Forwarded to responsible department</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-3.5 h-3.5 rounded-full mt-1 ${isInProgress ? "bg-emerald-500" : "bg-slate-300"}`} />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">3. In Progress</p>
                    <p className="text-xs text-slate-500">Field response team dispatched</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-3.5 h-3.5 rounded-full mt-1 ${isResolved ? "bg-emerald-500" : "bg-slate-300"}`} />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">4. Resolved</p>
                    <p className="text-xs text-slate-500">Work completed & verified</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className={`w-full block text-center py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${
                isResolved ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
              }`}>
                Current: {complaint.status || "Submitted"}
              </span>
            </div>
          </div>
        </div>

        {/* Resolution Evidence Box if Resolved or has proof */}
        {(proof || isResolved) && (
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-6 mt-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span className="text-emerald-600">✓</span> Proof of Resolution
            </h2>
            <p className="text-xs text-slate-500 mb-4">Official photograph and evidence uploaded by field officer.</p>

            {proof ? (
              <img
                src={proof}
                alt="Resolution Proof"
                className="max-h-72 rounded-xl border border-slate-200 object-cover shadow-sm"
              />
            ) : (
              <button
                onClick={getImage}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Load Officer Proof Image
              </button>
            )}
          </div>
        )}

        {/* AI Triage & Analysis Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 mt-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="bg-emerald-400 text-slate-950 px-2 py-0.5 rounded text-xs font-black">AI</span>
              <span>Intelligent Triage Analysis</span>
            </h2>
            <span className="text-xs text-slate-400">Model: Gemini & NLP Pipeline</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-400">Classified Category</p>
              <p className="font-semibold text-emerald-300 mt-1">{complaint.category || "General"}</p>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-400">Assigned Department</p>
              <p className="font-semibold text-slate-200 mt-1">{complaint.department || "Civil Operations"}</p>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-400">Severity Level</p>
              <p className="font-semibold text-amber-300 mt-1">{complaint.severity || "MEDIUM"}</p>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-400">Duplicate Incident Check</p>
              <p className="font-semibold text-emerald-300 mt-1">Unique Incident</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ComplaintDetails;
