import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_URL } from "../api/api";
import { 
  LocateFixed, 
  Mic, 
  MicOff, 
  AlertCircle, 
  ArrowLeft,
  X,
  UploadCloud,
  ShieldAlert,
  Send
} from "lucide-react";
import { addComplaint, getComplaints } from "../data/mockData";

function SubmitComplaint() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const baseTextRef = useRef("");

  const [complaint, setComplaint] = useState("");
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [language, setLanguage] = useState("en-IN");
  const [listening, setListening] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const languages = [
    { code: "en-IN", name: "English", native: "English" },
    { code: "hi-IN", name: "Hindi", native: "हिन्दी" },
    { code: "bn-IN", name: "Bengali", native: "বাংলা" },
    { code: "mr-IN", name: "Marathi", native: "मराठी" },
    { code: "ta-IN", name: "Tamil", native: "தமிழ்" },
    { code: "te-IN", name: "Telugu", native: "తెలుగు" },
    { code: "gu-IN", name: "Gujarati", native: "ગુજરાતી" },
    { code: "kn-IN", name: "Kannada", native: "ಕನ್ನಡ" },
    { code: "pa-IN", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
    { code: "ur-IN", name: "Urdu", native: "اردو" },
  ];

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  // Real-time AI Triage analysis
  const aiTriage = useMemo(() => {
    if (!complaint.trim()) {
      return {
        category: "Pending Input",
        department: "Automatic Routing",
        priority: "NORMAL",
        urgencyScore: 0,
        duplicateWarning: null,
      };
    }

    const t = complaint.toLowerCase();
    let category = "Other";
    let department = "Municipal Works";
    let priority = "MEDIUM";
    let urgencyScore = 45;

    if (t.includes("pothole") || t.includes("crater") || t.includes("road broken") || t.includes("asphalt")) {
      category = "Pothole";
      department = "Roads & Infrastructure";
      priority = "HIGH";
      urgencyScore = 80;
    } else if (t.includes("garbage") || t.includes("waste") || t.includes("trash") || t.includes("bin") || t.includes("dump")) {
      category = "Garbage";
      department = "Sanitation & Waste Mgmt";
      priority = "MEDIUM";
      urgencyScore = 60;
    } else if (t.includes("leak") || t.includes("pipe") || t.includes("water supply") || t.includes("burst")) {
      category = "Water Leakage";
      department = "Water Supply & Sewerage";
      priority = "HIGH";
      urgencyScore = 85;
    } else if (t.includes("light") || t.includes("lamp") || t.includes("dark") || t.includes("pole")) {
      category = "Streetlight";
      department = "Electricity Department";
      priority = "MEDIUM";
      urgencyScore = 55;
    } else if (t.includes("waterlog") || t.includes("flood") || t.includes("rainwater") || t.includes("drain")) {
      category = "Waterlogging";
      department = "Disaster Mgmt & Drainage";
      priority = "CRITICAL";
      urgencyScore = 95;
    }

    if (t.includes("danger") || t.includes("urgent") || t.includes("hospital") || t.includes("accident") || t.includes("hazard")) {
      priority = "CRITICAL";
      urgencyScore = Math.max(urgencyScore, 92);
    }

    // Check potential duplicate against active complaints
    const existing = getComplaints();
    const duplicate = existing.find(
      (c) =>
        c.category === category &&
        (c.location || "").toLowerCase().includes((location || "").toLowerCase()) &&
        location.trim().length > 3
    );

    return {
      category,
      department,
      priority,
      urgencyScore,
      duplicateWarning: duplicate ? duplicate.id || duplicate.incidentId : null,
    };
  }, [complaint, location]);

  const startListening = () => {
    setError("");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Try Google Chrome or Microsoft Edge.");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    baseTextRef.current = complaint.trim();

    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += text + " ";
        } else {
          interimTranscript += text;
        }
      }

      const spoken = (finalTranscript + interimTranscript).trim();
      const base = baseTextRef.current;
      setComplaint(base ? `${base} ${spoken}` : spoken);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setError("Microphone access was denied. Allow microphone access in your browser settings.");
      } else if (event.error !== "aborted" && event.error !== "no-speech") {
        setError("Speech recognition encountered an issue. You can type your complaint directly.");
      }
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch {
      setListening(false);
      recognitionRef.current = null;
      setError("Could not activate microphone. Please try again.");
    }
  };

  const getLiveLocation = () => {
    setError("");
    if (!navigator.geolocation) {
      setError("Live location is not supported by your browser.");
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoordinates({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        if (!location) {
          setLocation(`GPS Fix: Lat ${coords.latitude.toFixed(4)}, Long ${coords.longitude.toFixed(4)}`);
        }
        setGettingLocation(false);
      },
      (geoError) => {
        setGettingLocation(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError("Location access denied. Please enter your location manually.");
        } else {
          setError("Could not retrieve GPS coordinates. You can type your landmark manually.");
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handlePhotoChange = (event) => {
    setError("");
    const selectedPhoto = event.target.files?.[0] ?? null;

    if (!selectedPhoto) {
      setPhoto(null);
      setPhotoPreview(null);
      return;
    }

    if (!selectedPhoto.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, WebP).");
      return;
    }

    if (selectedPhoto.size > 10 * 1024 * 1024) {
      setError("The image must be 10 MB or smaller.");
      return;
    }

    setPhoto(selectedPhoto);
    setPhotoPreview(URL.createObjectURL(selectedPhoto));
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const submitComplaint = useCallback(
    async (event) => {
      event.preventDefault();
      setError("");

      if (loading) return;

      if (!complaint.trim()) {
        setError("Please describe your complaint or speak via the microphone.");
        return;
      }

      if (!location.trim()) {
        setError("Please enter the location or landmark.");
        return;
      }

      const formData = new FormData();
      formData.append("problem", complaint.trim());
      formData.append("location", location.trim());
      formData.append("language", language);

      if (coordinates) {
        formData.append("latitude", String(coordinates.latitude));
        formData.append("longitude", String(coordinates.longitude));
      }

      if (photo) {
        formData.append("photo", photo);
      }

      setLoading(true);

      try {
        const response = await fetch(`${API_URL}/api/complaint/registerComplaint`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || `Request failed (${response.status})`);
        }

        const result = await response.json();
        const targetId = result?.complaintId || result?.id || result?.incidentId;
        navigate(`/complaints/${targetId}`);
      } catch (submitError) {
        console.warn("Backend unavailable, saving complaint locally in test datastore:", submitError);

        const newRecord = addComplaint({
          title: complaint.length > 55 ? complaint.slice(0, 52) + "..." : complaint,
          description: complaint.trim(),
          location: location.trim(),
          language,
          latitude: coordinates?.latitude || null,
          longitude: coordinates?.longitude || null,
          category: aiTriage.category,
          department: aiTriage.department,
          priority: aiTriage.priority,
          severity: aiTriage.priority === "CRITICAL" ? "HIGH" : aiTriage.priority,
          status: "Submitted",
          photoUrl: photoPreview,
        });

        navigate(`/complaints/${newRecord.id}`);
      } finally {
        setLoading(false);
      }
    },
    [complaint, location, language, coordinates, photo, photoPreview, aiTriage, loading, token, navigate]
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Citizen Grievance Submission
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Form (8 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Report a Civic Hazard
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Speak in your mother tongue or type below. Our AI categorizes and dispatches to the correct department.
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={submitComplaint} className="space-y-6">
                
                {/* Language Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Speech & Text Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    disabled={listening || loading}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                  >
                    {languages.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.name} ({item.native})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Complaint Text Area & Voice Recorder */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Problem Description
                    </label>
                    <span className="text-xs text-slate-400">
                      {complaint.length} characters
                    </span>
                  </div>

                  <div className="relative">
                    <textarea
                      value={complaint}
                      onChange={(e) => setComplaint(e.target.value)}
                      placeholder="e.g. Broken water pipeline leaking near Gate 4, large pothole causing vehicle damage, street lamp not functioning..."
                      rows={5}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
                      required
                      disabled={loading}
                    />

                    {/* Speech Floating Button */}
                    <div className="absolute right-3 bottom-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={startListening}
                        disabled={loading}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          listening
                            ? "bg-rose-600 text-white animate-pulse"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {listening ? (
                          <>
                            <MicOff className="w-3.5 h-3.5" />
                            <span>Stop Mic</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5" />
                            <span>Speak</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Audio Visualizer Wave */}
                  {listening && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                        <span className="text-xs font-bold text-rose-800">
                          Listening in {languages.find((l) => l.code === language)?.name}...
                        </span>
                      </div>
                      <div className="flex items-center gap-1 h-5">
                        <div className="w-1 bg-rose-500 rounded-full h-full wave-bar"></div>
                        <div className="w-1 bg-rose-500 rounded-full h-full wave-bar"></div>
                        <div className="w-1 bg-rose-500 rounded-full h-full wave-bar"></div>
                        <div className="w-1 bg-rose-500 rounded-full h-full wave-bar"></div>
                        <div className="w-1 bg-rose-500 rounded-full h-full wave-bar"></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location Field & Live GPS */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Location Landmark
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="e.g. Opposite Sector 4 Community Center, Main Gate"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={getLiveLocation}
                        disabled={gettingLocation || loading}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        <LocateFixed className="w-3.5 h-3.5" />
                        <span>{gettingLocation ? "Detecting GPS..." : "Detect Live GPS Coordinates"}</span>
                      </button>

                      {coordinates && (
                        <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          📍 {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Photo Upload Zone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Visual Evidence (Optional)
                  </label>

                  {photoPreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 group">
                      <img
                        src={photoPreview}
                        alt="Evidence preview"
                        className="w-full h-48 object-cover"
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-rose-600 text-white rounded-xl transition-colors shadow-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] px-2.5 py-1 rounded-lg font-mono">
                        {photo?.name} ({(photo.size / (1024 * 1024)).toFixed(2)} MB)
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
                      <UploadCloud className="w-8 h-8 text-blue-500 mb-2" />
                      <p className="text-xs font-semibold text-slate-700">
                        Click to upload an issue photograph
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        JPG, PNG, WebP up to 10 MB
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        disabled={loading}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? "Transmitting to Triage Engine..." : "Submit Complaint for AI Triage"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* AI Inspector & Live Triage Card (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Triage Card */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-5">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-xs">
                    AI
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Live Triage Engine</h3>
                    <p className="text-[11px] text-slate-400">Real-time NLP Analysis</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  ACTIVE
                </span>
              </div>

              {/* Duplicate Detection Alert */}
              {aiTriage.duplicateWarning && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-300">Potential Duplicate Detected</p>
                    <p className="text-[11px] text-amber-200/80 mt-0.5">
                      An active complaint (#{aiTriage.duplicateWarning}) was recently reported for this location. Your report will be linked for faster escalation.
                    </p>
                  </div>
                </div>
              )}

              {/* Triage Parameters */}
              <div className="space-y-3 pt-2">
                <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Classified Category</span>
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                    {aiTriage.category}
                  </span>
                </div>

                <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Target Department</span>
                  <span className="text-xs font-semibold text-slate-200">
                    {aiTriage.department}
                  </span>
                </div>

                <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Estimated Priority</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${
                    aiTriage.priority === "CRITICAL" ? "bg-rose-950 text-rose-300 border border-rose-500/30" :
                    aiTriage.priority === "HIGH" ? "bg-orange-950 text-orange-300 border border-orange-500/30" :
                    "bg-amber-950 text-amber-300 border border-amber-500/30"
                  }`}>
                    {aiTriage.priority}
                  </span>
                </div>

                {/* Urgency Meter */}
                <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Urgency Confidence</span>
                    <span className="font-mono font-bold text-blue-400">{aiTriage.urgencyScore}%</span>
                  </div>
                  <div className="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 via-amber-400 to-rose-500 h-full transition-all duration-300"
                      style={{ width: `${aiTriage.urgencyScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                💡 <span className="font-semibold text-slate-300">How Triage Works:</span> Upon submission, our NLP engine maps your text, detects nearby duplicates, calculates urgency with safety overrides, and routes to field engineers.
              </div>
            </div>

            {/* Helpline Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2">
              <h4 className="font-bold text-sm text-slate-900">Immediate Disaster Emergency?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                For life-threatening civic hazards (gas leaks, live high-tension wires, structural building collapse), please dial the municipal disaster line immediately at <span className="font-bold text-blue-600">112 / 108</span>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SubmitComplaint;
