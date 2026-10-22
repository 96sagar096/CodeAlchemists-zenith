import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_URL } from "../api/api";
import { LocateFixed } from "lucide-react";
import { addComplaint } from "../data/mockData";

function SubmitComplaint() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  const [complaint, setComplaint] = useState("");
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [language, setLanguage] = useState("en-IN");
  const [listening, setListening] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const languages = [
    { code: "en-IN", name: "English" },
    { code: "hi-IN", name: "Hindi" },
    { code: "bn-IN", name: "Bengali" },
    { code: "gu-IN", name: "Gujarati" },
    { code: "kn-IN", name: "Kannada" },
    { code: "ml-IN", name: "Malayalam" },
    { code: "mr-IN", name: "Marathi" },
    { code: "or-IN", name: "Odia" },
    { code: "pa-IN", name: "Punjabi" },
    { code: "ta-IN", name: "Tamil" },
    { code: "te-IN", name: "Telugu" },
    { code: "ur-IN", name: "Urdu" },
  ];

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const startListening = () => {
    setError("");

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
          "Speech recognition is not supported in this browser. Try Google Chrome or Microsoft Edge."
      );
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }

      setComplaint(transcript.trim());
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setError("Microphone access was denied. Allow microphone access and try again.");
      } else if (event.error === "no-speech") {
        setError("No speech detected. Please try again.");
      } else if (event.error === "audio-capture") {
        setError("A microphone could not be detected.");
      } else if (event.error === "network") {
        setError("Speech recognition needs an internet connection.");
      } else if (event.error !== "aborted") {
        setError("Could not recognize your speech. Please try again.");
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
      setError("Could not start the microphone. Please try again.");
    }
  };

  const getLiveLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Live location is not supported by this browser.");
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setCoordinates({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
          setGettingLocation(false);
        },
        (geoError) => {
          setGettingLocation(false);

          if (geoError.code === geoError.PERMISSION_DENIED) {
            setError("Location access was denied. Allow location access and try again.");
          } else if (geoError.code === geoError.TIMEOUT) {
            setError("Getting your location timed out. Please try again.");
          } else {
            setError("Could not get your location. You can enter the area manually.");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
    );
  };

  const handlePhotoChange = (event) => {
    setError("");
    const selectedPhoto = event.target.files?.[0] ?? null;

    if (!selectedPhoto) {
      setPhoto(null);
      return;
    }

    if (!selectedPhoto.type.startsWith("image/")) {
      setPhoto(null);
      event.target.value = "";
      setError("Please select an image file.");
      return;
    }

    if (selectedPhoto.size > 10 * 1024 * 1024) {
      setPhoto(null);
      event.target.value = "";
      setError("The image must be 10 MB or smaller.");
      return;
    }

    setPhoto(selectedPhoto);
  };

  const inferCategory = (text) => {
    const t = text.toLowerCase();
    if (t.includes("pothole") || t.includes("crater") || t.includes("road")) {
      return { category: "Pothole", department: "Roads & Infrastructure", priority: "HIGH" };
    }
    if (t.includes("garbage") || t.includes("waste") || t.includes("trash") || t.includes("bin") || t.includes("rubbish")) {
      return { category: "Garbage", department: "Sanitation Department", priority: "MEDIUM" };
    }
    if (t.includes("leak") || t.includes("pipe") || t.includes("water supply")) {
      return { category: "Water Leakage", department: "Water Supply & Sewerage", priority: "HIGH" };
    }
    if (t.includes("light") || t.includes("lamp") || t.includes("dark")) {
      return { category: "Streetlight", department: "Electricity Department", priority: "MEDIUM" };
    }
    if (t.includes("flood") || t.includes("waterlog") || t.includes("rainwater") || t.includes("drain")) {
      return { category: "Waterlogging", department: "Disaster Management & Drainage", priority: "CRITICAL" };
    }
    return { category: "Other", department: "Municipal Grievances", priority: "LOW" };
  };

  const submitComplaint = useCallback(
      async (event) => {
        event.preventDefault();
        setError("");

        if (loading) return;

        if (!complaint.trim()) {
          setError("Please enter or speak your complaint.");
          return;
        }

        if (!location.trim()) {
          setError("Please enter your area or location.");
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
          const response = await fetch(
              `${API_URL}/api/complaint/registerComplaint`,
              {
                method: "POST",
                headers: token
                    ? { Authorization: `Bearer ${token}` }
                    : {},
                body: formData,
              }
          );

          if (!response.ok) {
            const message = await response.text();
            throw new Error(message || `Request failed (${response.status})`);
          }

          const result = await response.json();
          const targetId = result?.complaintId || result?.id || result?.incidentId;

          if (!targetId) {
            throw new Error("The server response did not include a complaint ID.");
          }

          navigate(`/complaints/${targetId}`);
        } catch (submitError) {
          console.warn("Backend unavailable, saving complaint locally in testing mode:", submitError);
          const meta = inferCategory(complaint);
          const newRecord = addComplaint({
            title: complaint.length > 55 ? complaint.slice(0, 52) + "..." : complaint,
            description: complaint.trim(),
            location: location.trim(),
            language,
            latitude: coordinates?.latitude || null,
            longitude: coordinates?.longitude || null,
            category: meta.category,
            department: meta.department,
            priority: meta.priority,
            severity: meta.priority === "CRITICAL" ? "HIGH" : meta.priority,
            status: "Submitted",
            photoUrl: photo ? URL.createObjectURL(photo) : null,
          });

          navigate(`/complaints/${newRecord.id}`);
        } finally {
          setLoading(false);
        }
      },
      [complaint, location, language, coordinates, photo, loading, token, navigate]
  );

  return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto max-w-3xl p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Submit Civic Complaint</h1>
            <p className="text-slate-500 mt-1">
              Speak or type your problem in your preferred Indian language.
            </p>
          </div>

          <form
              onSubmit={submitComplaint}
              className="rounded-2xl bg-white p-7 shadow-sm border border-slate-100"
          >
            <label className="mb-2 block font-semibold text-slate-800" htmlFor="language">
              Language Selection
            </label>
            <select
                id="language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="mb-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={listening || loading}
            >
              {languages.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name}
                  </option>
              ))}
            </select>

            <label className="mb-2 block font-semibold text-slate-800" htmlFor="complaint">
              Describe the Civic Issue
            </label>
            <textarea
                id="complaint"
                value={complaint}
                onChange={(event) => setComplaint(event.target.value)}
                placeholder="Type or click the microphone to describe the issue..."
                className="h-36 w-full resize-none rounded-xl border border-slate-200 p-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
            />

            <div className="mt-3 flex items-center gap-3">
              <button
                  type="button"
                  onClick={startListening}
                  disabled={loading}
                  className={`rounded-xl px-5 py-2.5 font-medium text-white transition-colors ${
                      listening ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-blue-700 hover:bg-blue-800"
                  }`}
              >
                {listening ? "⏹ Stop Recording" : "🎤 Speak Complaint"}
              </button>
            </div>

            {listening && (
                <div className="mt-3 rounded-xl bg-blue-50 p-3 border border-blue-100">
                  <p className="font-semibold text-blue-700 text-sm">Listening to speech...</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    Speaking in {languages.find((item) => item.code === language)?.name}
                  </p>
                </div>
            )}

            <label className="mb-2 mt-6 block font-semibold text-slate-800" htmlFor="location">
              Location / Landmark / Area
            </label>
            <input
                id="location"
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g. Near Main Gate, Sector 4, MG Road"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
            />

            <button
                type="button"
                onClick={getLiveLocation}
                disabled={gettingLocation || loading}
                className="mt-3 inline-flex items-center rounded-xl border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <LocateFixed className="mr-2 inline h-4 w-4" />
              {gettingLocation ? "Capturing GPS..." : "Detect My Live GPS Location"}
            </button>

            {coordinates && (
                <p className="mt-2 text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block">
                  GPS Fixed: {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}
                </p>
            )}

            <label className="mb-2 mt-6 block font-semibold text-slate-800" htmlFor="photo">
              Photo Evidence <span className="font-normal text-slate-400 text-sm">(optional)</span>
            </label>
            <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={loading}
                className="block w-full rounded-xl border border-slate-200 p-2.5 text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-xs text-slate-500">
              Supports JPEG/PNG up to 10 MB.
              {photo ? ` Attached: ${photo.name}` : ""}
            </p>

            {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="mt-7 w-full rounded-xl bg-blue-700 py-3.5 font-bold text-white hover:bg-blue-800 transition-colors disabled:opacity-60 shadow-md shadow-blue-500/10"
            >
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>
          </form>
        </main>
      </div>
  );
}

export default SubmitComplaint;
