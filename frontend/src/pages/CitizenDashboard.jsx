
import Navbar from "../components/Navbar"
import { Link } from "react-router-dom"
import { useState ,useEffect } from "react"
import { API_URL } from "../api/api";

function CitizenDashboard() {
  const [complaints, setComplaints] = useState([])
  const[loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_URL}/api/complaint/my`,{
            method: "GET",
             headers: {
              "Authorization": `Bearer ${token}`
            }
  
          }
        );
  
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
  
        const data = await response.json();
  
        console.log(data);
  
        setComplaints(data);
  
      } catch (error) {
        console.log("You have an error:", error);
      }finally {
        setLoading(false);
      }
    }
  
    fetchData();
  }, []);
  

 if(!loading){ 
  
  const total = complaints.length;

  const resolved = complaints.filter(
    complaint => complaint.status === "RESOLVED"
  ).length;

  const pending = complaints.filter(
    complaint => complaint.status !== "RESOLVED"
  ).length;

  const highPriority = complaints.filter(
    complaint => complaint.severity === "HIGH"
  ).length;


  return (
    <div>

      <Navbar />

      <main className="p-6 max-w-7xl mx-auto">

        {/* Dashboard Heading */}
        <h1 className="text-3xl font-bold mb-2">
          Citizen Dashboard
        </h1>

        <p className="text-gray-500 mb-6">
          Track and manage your civic complaints
        </p>


        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

          {/* Total */}
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-gray-500">
              Total Complaints
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {total}
            </h2>
          </div>


          {/* Pending */}
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-gray-500">
              Pending
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {pending}
            </h2>
          </div>


          {/* Resolved */}
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-gray-500">
              Resolved
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {resolved}
            </h2>
          </div>


          {/* High Priority */}
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-gray-500">
              High Priority
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {highPriority}
            </h2>
          </div>

        </div>


        {/* Complaints Section */}
        <div className="bg-white rounded-xl shadow p-6">

          <div className="flex justify-between items-center mb-4">

            <h2 className="text-xl font-bold">
              Recent Complaints
            </h2>
            <Link to="/submit">
            <button className="bg-blue-700 text-white px-4 py-2 rounded-lg">
              + New Complaint
            </button>
              </Link>
          </div>


          {/* Complaint List */}
          <div className="space-y-4">

            {complaints.length === 0 ? (

              <p className="text-gray-500 text-center py-6">
                No complaints found.
              </p>

            ) : (

              complaints.map(complaint => (

                <Link
                  key={complaint.complaintId}
                  to={`/complaints/${complaint.complaintId}`}
                  className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50"
                >

                  {/* Left Side */}
                  <div className="flex-1">

                    <h3 className="font-semibold text-lg">
                      {complaint.department}
                    </h3>

                    <p className="text-gray-700 mt-1">
                      {complaint.description}
                    </p>

                    <p className="text-sm text-gray-500 mt-2">
                      Complaint ID: #{complaint.complaintId}
                    </p>

                    <p className="text-sm text-gray-500">
                      Incident ID: #{complaint.incidentId}
                    </p>

                    <p className="text-sm text-gray-500">
                      Created:{" "}
                      {new Date(complaint.createdAt).toLocaleString()}
                    </p>

                  </div>


                  {/* Right Side */}
                  <div className="text-right ml-6">

                    {/* Status */}
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        complaint.status === "RESOLVED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {complaint.status}
                    </span>


                    {/* Severity */}
                    <p
                      className={`text-sm font-semibold mt-2 ${
                        complaint.severity === "HIGH"
                          ? "text-red-600"
                          : complaint.severity === "MEDIUM"
                          ? "text-orange-500"
                          : "text-green-600"
                      }`}
                    >
                      {complaint.severity}
                    </p>


                    {/* Location */}
                    <p className="text-sm text-gray-500 mt-1">
                      {complaint.location || "Location not available"}
                    </p>

                  </div>

                </Link>

              ))

            )}

          </div>

        </div>

      </main>

    </div>
  );
}
                  
}

export default CitizenDashboard
