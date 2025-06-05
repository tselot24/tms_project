import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ENDPOINTS } from "../utilities/endpoints";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";

const RefuelingRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null); // State for selected request details
  const [showForm, setShowForm] = useState(false); // State for showing the form
  const [formData, setFormData] = useState({ date: "", destination: "" }); // Updated form data state

  // Fetch refueling requests
  const fetchRefuelingRequests = async () => {
    const accessToken = localStorage.getItem("authToken");

    if (!accessToken) {
      console.error("No access token found.");
      return;
    }

    try {
      const response = await fetch(ENDPOINTS.MY_REFUELING_REQUESTS, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch refueling requests");
      }

      const data = await response.json();
      console.log("Fetched Refueling Requests:", data);
      setRequests(data.results || []);
    } catch (error) {
      console.error("Error fetching refueling requests:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem("authToken");

    if (!accessToken) {
      console.error("No access token found.");
      toast.error("You are not authorized. Please log in again.");
      return;
    }

    try {
      console.log("Payload Sent:", formData); // Log the payload being sent
      const response = await fetch(ENDPOINTS.CREATE_REFUELING_REQUEST, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Send the correct payload
      });

      if (!response.ok) {
        throw new Error("Failed to create refueling request");
      }

      const newRequest = await response.json();
      setRequests((prevRequests) => [newRequest, ...prevRequests]);
      setFormData({ date: "", destination: "" }); // Reset form data
      setShowForm(false);
      toast.success("Refueling request created successfully!");
    } catch (error) {
      console.error("Error creating refueling request:", error);
      toast.error("Failed to create refueling request.");
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    fetchRefuelingRequests();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Refueling Requests</h2>

      {/* New Refueling Request Button */}
      <div className="d-flex mb-4">
        <button
          className="btn"
          style={{ width: "300px", backgroundColor: "#181E4B", color: "white" }}
          onClick={() => setShowForm(true)}
        >
          New Refueling Request
        </button>
      </div>

      {/* Refueling Request Form */}
      {showForm && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">New Refueling Request</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowForm(false)}
                >
                  <IoClose />
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="date" className="form-label">
                      Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="destination" className="form-label">
                      Destination
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="destination"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      placeholder="Enter the destination"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    style={{ width: "300px", backgroundColor: "#181E4B", color: "white" }}
                    className="btn"
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refueling Requests Table */}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading refueling requests...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="thead-dark">
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request, index) => (
                <tr key={request.id}>
                  <td>{index + 1}</td>
                  <td>{new Date(request.created_at).toLocaleDateString()}</td> {/* Use created_at */}
                  <td>{request.destination || "N/A"}</td>
                  <td>{request.status || "N/A"}</td>
                  <td>
                    <button
                      className="btn btn-sm"
                      style={{ backgroundColor: "#181E4B", color: "white" }}
                      onClick={() => setSelectedRequest(request)}
                    >
                      View Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Viewing Details */}
      {selectedRequest && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Refueling Request Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedRequest(null)}
                >
                  <IoClose />
                </button>
              </div>
              <div className="modal-body">
                <p><strong>Date:</strong> {new Date(selectedRequest.created_at).toLocaleDateString()}</p> {/* Use created_at */}
                <p><strong>Destination:</strong> {selectedRequest.destination}</p>
                <p><strong>Status:</strong> {selectedRequest.status}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefuelingRequest;
