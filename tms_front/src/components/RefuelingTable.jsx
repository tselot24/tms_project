import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ENDPOINTS } from "../utilities/endpoints";
import { IoClose } from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import Logo from "../assets/Logo.jpg"; // Import the logo

const RefuelingTable = () => {
  const [refuelingRequests, setRefuelingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchRefuelingRequests = async () => {
    const accessToken = localStorage.getItem("authToken");

    if (!accessToken) {
      console.error("No access token found.");
      return;
    }

    try {
      const response = await fetch(ENDPOINTS.REFUELING_REQUEST_LIST, {
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
      console.log("Fetched Refueling Requests:", data); // Log fetched data
      setRefuelingRequests(data.results || []);
    } catch (error) {
      console.error("Error fetching refueling requests:", error);
      toast.error("Failed to fetch refueling requests."); // Error toast
    } finally {
      setLoading(false);
    }
  };

  // Handle actions (approve, reject, forward)
  const handleAction = async (id, action) => {
    const accessToken = localStorage.getItem("authToken");

    if (!accessToken) {
      console.error("No access token found.");
      return;
    }

    setActionLoading(true);
    try {
      const body = { action };
      if (action === "reject") {
        body.rejection_message = rejectionMessage;
      }

      const response = await fetch(ENDPOINTS.APPREJ_REFUELING_REQUEST(id), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} the refueling request`);
      }

      console.log(`Refueling request ${action}d successfully`);
      fetchRefuelingRequests(); // Refresh the list after action
      setSelectedRequest(null); // Close the detail view
      toast.success(`Request ${action === "forward" ? "forwarded" : "rejected"} successfully!`); // Success toast
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      toast.error(`Failed to ${action} the request.`); // Error toast
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectAction = () => {
    if (rejectionMessage.trim() && selectedRequest) {
      handleAction(selectedRequest.id, "reject");
      setShowRejectModal(false);
    } else {
      toast.error("Rejection message cannot be empty."); // Error toast
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    fetchRefuelingRequests();
  }, []);

  return (
    <div className="container mt-5">
      <ToastContainer /> {/* Add ToastContainer */}
      <h2 className="text-center mb-4">Refueling Requests</h2>

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
                <th>Driver</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {refuelingRequests.map((request, index) => (
                <tr key={request.id}>
                  <td>{index + 1}</td>
                  <td>{new Date(request.created_at).toLocaleDateString()}</td>
                  <td>{request.destination || "N/A"}</td>
                  <td>{request.requester_name || "N/A"}</td>
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
                <img src={Logo} alt="Logo" style={{ width: "100px", height: "70px", marginRight: "10px" }} />
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
                <p><strong>Date:</strong> {new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                <p><strong>Destination:</strong> {selectedRequest.destination}</p>
                <p><strong>Status:</strong> {selectedRequest.status}</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn"
                  style={{ backgroundColor: "#181E4B", color: "white" }}
                  onClick={() => handleAction(selectedRequest.id, "forward")}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Processing..." : "Forward"}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Processing..." : "Reject"}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedRequest(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reject Request</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRejectModal(false)}
                >
                  <IoClose />
                </button>
              </div>
              <div className="modal-body">
                <textarea
                  className="form-control"
                  placeholder="Enter rejection reason"
                  value={rejectionMessage}
                  onChange={(e) => setRejectionMessage(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-danger"
                  onClick={handleRejectAction}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefuelingTable;