import { Link } from "react-router-dom"

import {  createContext , useEffect  , useState } from "react";
import { useComplaints } from "../pages/ComplaintContext";
import { API_URL } from "../api/api";

function OfficerDashboard() {

     
 

  const [loading, setLoading] = useState(true);
  const { complaints, setComplaints } = useComplaints();
 
 useEffect(() => {
  async function fetchData() {
    try {
      const token = localStorage.getItem("token1");
      const response = await fetch(
        `${API_URL}/api/adminInfo/complaints`,{
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

      setComplaints(data.complaintResponses);

    } catch (error) {
      console.log("You have an error:", error);
    } finally {
      setLoading(false);
    }
  }

  fetchData();
}, [setComplaints]);
  if (loading) {
  return <div>Loading...</div>;
  }else{
    const total = complaints.length

  const submitted = complaints.filter(
    complaint => complaint.status === "Submitted"
  ).length

  const assigned = complaints.filter(
    complaint => complaint.status === "Assigned"
  ).length

  const inProgress = complaints.filter(
    complaint => complaint.status === "In Progress"
  ).length

  const resolved = complaints.filter(
    complaint => complaint.status === "Resolved"
  ).length

  const highPriority = complaints.filter(
    complaint => complaint.priority === "HIGH"
  ).length

  return (
    <div>

      <nav className="site-nav bg-blue-700 text-white px-6 py-4 flex justify-between items-center">

        <Link
          to="/officer"
          className="text-xl font-bold"
        >
          <span className="nav-brand-mark">PN</span> Problem Nivaran <span className="officer-label">Officer</span>
        </Link>

        <div className="nav-links flex gap-6">

          <Link to="/officer">
            Dashboard
          </Link>

          <Link to="/officer/complaints">
            Complaints
          </Link>

          <Link to="/login">
            Logout
          </Link>

        </div>

      </nav>

      <main className="p-6 max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold">
          Officer Dashboard
        </h1>

        <p className="text-gray-500 mb-6">
          Manage and resolve citizen complaints
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-sm">
              Total
            </p>
            <p className="text-2xl font-bold">
              {total}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-sm">
              Submitted
            </p>
            <p className="text-2xl font-bold">
              {submitted}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-sm">
              Assigned
            </p>
            <p className="text-2xl font-bold">
              {assigned}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-sm">
              In Progress
            </p>
            <p className="text-2xl font-bold">
              {inProgress}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-sm">
              Resolved
            </p>
            <p className="text-2xl font-bold">
              {resolved}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-sm">
              High Priority
            </p>
            <p className="text-2xl font-bold">
              {highPriority}
            </p>
          </div>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <div className="flex justify-between items-center mb-5">

            <h2 className="text-xl font-bold">
              Recent Complaints
            </h2>

            <Link
              to="/officer/complaints"
              className="bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              View All
            </Link>

          </div>

          <div className="space-y-3">

            {complaints.map(complaint => (

              <Link
                key={complaint.incidentId}
                to={`/AdminComplaintDetails/${complaint.incidentId}`}
                className="block border rounded-lg p-4 hover:bg-gray-50"
              >

                <div className="flex justify-between">

                  <div>

                    <p className="font-semibold">
                      #{complaint.incidentId} - {complaint.title}
                    </p>

                    {/* <p className="text-sm text-gray-500">
                      {complaint.category} • {complaint.department}
                    </p> */}

                  </div>

                  <div className="text-right">

                    <p className="font-medium">
                      {complaint.status}
                    </p>

                    <p className="text-sm text-gray-500">
                      Priority: {complaint.severity}
                    </p>

                  </div>

                </div>

              </Link>

            ))}

          </div>

        </div>

      </main>

    </div>
  )
}}

export default OfficerDashboard
