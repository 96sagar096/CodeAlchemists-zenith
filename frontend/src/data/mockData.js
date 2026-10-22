export const initialComplaints = [
  {
    id: 101,
    incidentId: 101,
    complaintId: 101,
    title: "Large crater pothole on Main Road near College Gate",
    description: "There is a deep pothole on the main avenue right outside the college gate. Bikes are swerving dangerously and an accident almost occurred.",
    category: "Pothole",
    department: "Roads & Infrastructure",
    priority: "HIGH",
    severity: "HIGH",
    status: "In Progress",
    date: "22 Oct 2026",
    createdAt: "2026-10-22T09:30:00Z",
    location: "Main Avenue, Gate 2",
    latitude: 23.2599,
    longitude: 77.4126,
    language: "en-IN",
    proof: null,
    resolutionEvidenceUrl: null
  },
  {
    id: 102,
    incidentId: 102,
    complaintId: 102,
    title: "Garbage accumulation near Block C hostel",
    description: "Waste has not been collected for four days. Bins are overflowing and creating foul smell near student accommodation.",
    category: "Garbage",
    department: "Sanitation Department",
    priority: "MEDIUM",
    severity: "MEDIUM",
    status: "Assigned",
    date: "21 Oct 2026",
    createdAt: "2026-10-21T14:15:00Z",
    location: "Block C Hostel, Sector 3",
    latitude: 23.2640,
    longitude: 77.4190,
    language: "en-IN",
    proof: null,
    resolutionEvidenceUrl: null
  },
  {
    id: 103,
    incidentId: 103,
    complaintId: 103,
    title: "Street lights dark along Library lane",
    description: "All street lamps from library to cafeteria have stopped functioning. Area is completely dark and unsafe at night.",
    category: "Streetlight",
    department: "Electricity Department",
    priority: "HIGH",
    severity: "HIGH",
    status: "Submitted",
    date: "22 Oct 2026",
    createdAt: "2026-10-22T08:00:00Z",
    location: "Library Lane to Cafeteria",
    latitude: 23.2580,
    longitude: 77.4110,
    language: "en-IN",
    proof: null,
    resolutionEvidenceUrl: null
  },
  {
    id: 104,
    incidentId: 104,
    complaintId: 104,
    title: "Pipeline burst flooding sector road",
    description: "Drinking water supply pipeline cracked and gushing water onto the road. Water pressure in nearby buildings dropped to zero.",
    category: "Water Leakage",
    department: "Water Supply & Sewerage",
    priority: "HIGH",
    severity: "HIGH",
    status: "Resolved",
    date: "19 Oct 2026",
    createdAt: "2026-10-19T11:00:00Z",
    location: "Sector 4 Market Circle",
    latitude: 23.2610,
    longitude: 77.4120,
    language: "en-IN",
    proof: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=60",
    resolutionEvidenceUrl: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 105,
    incidentId: 105,
    complaintId: 105,
    title: "Severe waterlogging near metro underpass",
    description: "Rainwater accumulated more than 2 feet high under the railway underpass. Vehicles are stuck.",
    category: "Waterlogging",
    department: "Disaster Management & Drainage",
    priority: "CRITICAL",
    severity: "HIGH",
    status: "In Progress",
    date: "22 Oct 2026",
    createdAt: "2026-10-22T06:45:00Z",
    location: "Railway Underpass, Sector 2",
    latitude: 23.2605,
    longitude: 77.4130,
    language: "en-IN",
    proof: null,
    resolutionEvidenceUrl: null
  }
];

export const complaints = initialComplaints;

export function getComplaints() {
  try {
    const savedComplaints = localStorage.getItem("complaints");
    if (savedComplaints) {
      const parsed = JSON.parse(savedComplaints);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not read complaints from localStorage", e);
  }

  try {
    localStorage.setItem("complaints", JSON.stringify(initialComplaints));
  } catch (e) {
    console.warn("Could not write initial complaints to localStorage", e);
  }

  return initialComplaints;
}

export function saveComplaints(data) {
  try {
    localStorage.setItem("complaints", JSON.stringify(data));
  } catch (e) {
    console.warn("Could not save complaints to localStorage", e);
  }
}

export function addComplaint(complaint) {
  const current = getComplaints();
  const nextId = current.length > 0 ? Math.max(...current.map(c => Number(c.id || c.incidentId || 0))) + 1 : 101;
  const newRecord = {
    ...complaint,
    id: nextId,
    incidentId: nextId,
    complaintId: nextId,
    status: complaint.status || "Submitted",
    priority: complaint.priority || "MEDIUM",
    severity: complaint.severity || "MEDIUM",
    date: complaint.date || new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    createdAt: complaint.createdAt || new Date().toISOString()
  };
  const updated = [newRecord, ...current];
  saveComplaints(updated);
  return newRecord;
}

export function updateComplaint(id, updates) {
  const current = getComplaints();
  const updated = current.map(c => {
    if (String(c.id) === String(id) || String(c.incidentId) === String(id)) {
      return { ...c, ...updates };
    }
    return c;
  });
  saveComplaints(updated);
  return updated;
}
