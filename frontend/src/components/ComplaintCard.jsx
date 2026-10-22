import { Link } from "react-router-dom";
import { 
  MapPin, 
  ArrowUpRight, 
  AlertTriangle, 
  Trash2, 
  Droplets, 
  Lightbulb, 
  Waves, 
  FileText,
} from "lucide-react";

export default function ComplaintCard({ complaint }) {
  if (!complaint) return null;

  const id = complaint.id || complaint.incidentId || complaint.complaintId;

  const getCategoryIcon = (category) => {
    const c = String(category || "").toLowerCase();
    if (c.includes("pothole") || c.includes("road")) return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    if (c.includes("garbage") || c.includes("waste")) return <Trash2 className="w-4 h-4 text-emerald-500" />;
    if (c.includes("leak") || c.includes("water supply")) return <Droplets className="w-4 h-4 text-blue-500" />;
    if (c.includes("light") || c.includes("lamp")) return <Lightbulb className="w-4 h-4 text-yellow-500" />;
    if (c.includes("waterlog") || c.includes("flood")) return <Waves className="w-4 h-4 text-cyan-500" />;
    return <FileText className="w-4 h-4 text-slate-500" />;
  };

  const getStatusBadge = (status) => {
    const s = String(status || "").toUpperCase();
    if (s === "RESOLVED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Resolved
        </span>
      );
    }
    if (s.includes("PROGRESS")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          In Progress
        </span>
      );
    }
    if (s === "ASSIGNED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
          Assigned
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        Submitted
      </span>
    );
  };

  const priority = String(complaint.priority || complaint.severity || "MEDIUM").toUpperCase();

  const priorityStyles = {
    CRITICAL: "bg-red-50 text-red-700 border-red-200",
    HIGH: "bg-orange-50 text-orange-700 border-orange-200",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
    LOW: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Top Accent Strip */}
      <div 
        className={`h-1.5 w-full ${
          priority === "CRITICAL" ? "bg-gradient-to-r from-red-600 to-rose-500" :
          priority === "HIGH" ? "bg-gradient-to-r from-orange-500 to-amber-500" :
          priority === "MEDIUM" ? "bg-gradient-to-r from-amber-400 to-yellow-400" :
          "bg-slate-300"
        }`} 
      />

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200/60">
                #{id}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-200/50">
                {getCategoryIcon(complaint.category)}
                <span>{complaint.category || "General"}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${priorityStyles[priority] || priorityStyles.MEDIUM}`}>
                {priority}
              </span>
              {getStatusBadge(complaint.status)}
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-base leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
            {complaint.title || complaint.category || "Civic Complaint"}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {complaint.description || "No detailed description recorded."}
          </p>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 truncate max-w-[200px]" title={complaint.location}>
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{complaint.location || "Recorded Location"}</span>
          </div>

          <Link
            to={`/complaints/${id}`}
            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 transition-colors group/btn"
          >
            <span>Timeline</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
