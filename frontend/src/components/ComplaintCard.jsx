import { Link } from "react-router-dom";

export default function ComplaintCard({ complaint }) {
  if (!complaint) return null;

  const id = complaint.id || complaint.incidentId || complaint.complaintId;
  const statusColors = {
    Submitted: "bg-blue-100 text-blue-800",
    Assigned: "bg-purple-100 text-purple-800",
    "In Progress": "bg-amber-100 text-amber-800",
    Resolved: "bg-green-100 text-green-800",
    RESOLVED: "bg-green-100 text-green-800",
  };

  const priorityColors = {
    LOW: "bg-gray-100 text-gray-700",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-orange-100 text-orange-800",
    CRITICAL: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            #{id}
          </span>
          <div className="flex gap-1.5">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded ${
                priorityColors[complaint.priority] || "bg-gray-100 text-gray-700"
              }`}
            >
              {complaint.priority || "NORMAL"}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded ${
                statusColors[complaint.status] || "bg-blue-100 text-blue-800"
              }`}
            >
              {complaint.status || "Submitted"}
            </span>
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
          {complaint.title || complaint.category || "Civic Complaint"}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {complaint.description || "No description provided."}
        </p>
      </div>

      <div className="border-t pt-3 text-xs text-gray-500 flex items-center justify-between">
        <div className="truncate max-w-[180px]">
          <span className="font-medium text-gray-700">📍 {complaint.location || "Location on record"}</span>
        </div>
        <Link
          to={`/complaints/${id}`}
          className="text-blue-600 font-semibold hover:underline ml-2"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}
