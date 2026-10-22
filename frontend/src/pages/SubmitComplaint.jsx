import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_URL } from "../api/api";
import { LocateFixed } from "lucide-react";

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
          "Speech recognition is not supported in this browser. Try Google Chrome."
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

          if (!result?.complaintId) {
            throw new Error("The server response did not include a complaint ID.");
          }

          navigate(`/complaints/${result.complaintId}`);
        } catch (submitError) {
          setError(
              submitError.message || "Could not submit your complaint. Please try again."
          );
        } finally {
          setLoading(false);
        }
      },
      [complaint, location, language, coordinates, photo, loading, token, navigate]
  );

  return (
      <div>
        <Navbar />

        <main className="mx-auto max-w-3xl p-6">
          <h1 className="mb-2 text-3xl font-bold">Submit Complaint</h1>
          <p className="mb-6 text-gray-500">
            Speak or type your civic problem in your preferred language.
          </p>

          <form
              onSubmit={submitComplaint}
              className="rounded-xl bg-white p-6 shadow"
          >
            <label className="mb-2 block font-medium" htmlFor="language">
              Select Language
            </label>
            <select
                id="language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="mb-5 w-full rounded-lg border px-4 py-3"
                disabled={listening || loading}
            >
              {languages.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name}
                  </option>
              ))}
            </select>

            <label className="mb-2 block font-medium" htmlFor="complaint">
              Describe your complaint
            </label>
            <textarea
                id="complaint"
                value={complaint}
                onChange={(event) => setComplaint(event.target.value)}
                placeholder="Speak or type your complaint..."
                className="h-40 w-full resize-none rounded-lg border p-4"
                required
                disabled={loading}
            />

            <button
                type="button"
                onClick={startListening}
                disabled={loading}
                className={`mt-4 rounded-lg px-6 py-3 text-white ${
                    listening ? "bg-red-600" : "bg-blue-700 hover:bg-blue-800"
                }`}
            >
              {listening ? "Stop Listening" : "Speak Complaint"}
            </button>

            {listening && (
                <div className="mt-3 rounded-lg bg-blue-50 p-3">
                  <p className="font-medium text-blue-700">Listening...</p>
                  <p className="text-sm text-gray-500">
                    Speak clearly in{" "}
                    {languages.find((item) => item.code === language)?.name}.
                  </p>
                </div>
            )}

            <label className="mb-2 mt-5 block font-medium" htmlFor="location">
              Location / area
            </label>
            <input
                id="location"
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Enter your area or landmark"
                className="w-full rounded-lg border px-4 py-3"
                required
                disabled={loading}
            />

            <button
                type="button"
                onClick={getLiveLocation}
                disabled={gettingLocation || loading}
                className="mt-3 rounded-lg border border-blue-700 px-4 py-2 text-blue-700 disabled:opacity-50"
            >
              <LocateFixed className="mr-2 inline h-4 w-4" />
              {gettingLocation ? "Getting location..." : "Use my live location"}
            </button>

            {coordinates && (
                <p className="mt-2 text-sm text-gray-600">
                  Latitude: {coordinates.latitude} · Longitude: {coordinates.longitude}
                </p>
            )}

            <label className="mb-2 mt-5 block font-medium" htmlFor="photo">
              Photo evidence <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={loading}
                className="block w-full rounded-lg border p-3"
            />
            <p className="mt-1 text-sm text-gray-500">
              Image files only, up to 10 MB.
              {photo ? ` Selected: ${photo.name}` : ""}
            </p>

            {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="mt-6 rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>
          </form>
        </main>
      </div>
  );
}

export default SubmitComplaint;