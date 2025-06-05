import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ENDPOINTS } from "../utilities/endpoints";
import { IoClose } from "react-icons/io5";
import CustomPagination from './CustomPagination';
import { Eye } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Logo from "../assets/Logo.jpg"; // Import the logo

const GSmaintenance = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null); // State for selected request details
  const [actionLoading, setActionLoading] = useState(false); // State for approve/reject actions
  const [rejectionMessage, setRejectionMessage] = useState(""); // State for rejection message
  const [showConfirmModal, setShowConfirmModal] = useState(false); // State for confirmation modal
  const [showRejectModal, setShowRejectModal] = useState(false); // State for rejection modal
  const [pendingAction, setPendingAction] = useState(null); // State for pending action
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [maintenanceLetter, setMaintenanceLetter] = useState(null); // State for maintenance letter file
  const [receiptFile, setReceiptFile] = useState(null); // State for receipt file
  const [maintenanceTotalCost, setMaintenanceTotalCost] = useState(""); // State for total cost

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageRequests = maintenanceRequests.slice(startIndex, endIndex);

  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setFile(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  // Fetch maintenance requests
  const fetchMaintenanceRequests = async () => {
    const accessToken = localStorage.getItem("authToken");
  
    if (!accessToken) {
      console.error("No access token found.");
      return;
    }
  
    try {
      const response = await fetch(ENDPOINTS.LIST_MAINTENANCE_REQUESTS, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch maintenance requests");
      }
  
      const data = await response.json();
      setMaintenanceRequests(data.results || []); // Update state with fetched data
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  // Handle actions (forward, reject)
  const handleAction = async (id, action) => {
    if (!maintenanceLetter || !receiptFile || !maintenanceTotalCost) {
      toast.error("Please upload all required files and provide the total cost before proceeding.");
      return;
    }

    const accessToken = localStorage.getItem("authToken");

    if (!accessToken) {
      console.error("No access token found.");
      return;
    }

    setActionLoading(true);
    try {
      const body = { action };
      if (action === "reject") {
        if (!rejectionMessage.trim()) {
          toast.error("Rejection message cannot be empty.");
          return;
        }
        body.rejection_message = rejectionMessage; // Include rejection message for rejection action
      }

      const response = await fetch(ENDPOINTS.MAINTENANCE_REQUEST_ACTION(id), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} the maintenance request`);
      }

      fetchMaintenanceRequests(); // Refresh the list
      setSelectedRequest(null); // Close the detail view
      toast.success(`Request ${action}ed successfully.`);
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      toast.error(`Failed to ${action} the maintenance request.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitFiles = async (id) => {
    const accessToken = localStorage.getItem("authToken");

    if (!accessToken) {
      console.error("No access token found.");
      return;
    }

    if (!maintenanceLetter || !receiptFile || !maintenanceTotalCost) {
      toast.error("Please upload all required files and provide the total cost.");
      return;
    }

    const formData = new FormData();
    formData.append("maintenance_letter_file", maintenanceLetter); // Correct field name
    formData.append("maintenance_receipt_file", receiptFile); // Correct field name
    formData.append("maintenance_total_cost", maintenanceTotalCost); // Correct field name

    try {
      const response = await fetch(ENDPOINTS.SUBMIT_MAINTENANCE_FILES(id), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend response:", errorText);
        throw new Error("Failed to submit maintenance files");
      }

      toast.success("Files submitted successfully!");
      fetchMaintenanceRequests(); 
    } catch (error) {
      console.error("Error submitting maintenance files:", error);
      toast.error("Failed to submit maintenance files.");
    }
  };

  const handleConfirmAction = () => {
    if (pendingAction && selectedRequest) {
      handleAction(selectedRequest.id, pendingAction);
    }
    setShowConfirmModal(false);
  };

  const handleRejectAction = () => {
    if (!rejectionMessage.trim()) {
      toast.error("Rejection message cannot be empty.");
      return;
    }
    if (selectedRequest) {
      handleAction(selectedRequest.id, "reject"); // Use the correct `id` from the selected request
      setShowRejectModal(false);
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  return (
    <div className="container mt-5">
        <ToastContainer />
      <h2 className="text-center mb-4">Maintenance Requests</h2>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading maintenance requests...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="thead-dark">
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Requester Name</th>
                <th>Requester's Car</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentPageRequests.length > 0 ? (
                currentPageRequests.map((request, index) => (
                  <tr key={request.id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td> {/* Correct numbering */}
                    <td>{new Date(request.date).toLocaleDateString()}</td>
                    <td>{request.requester_name || "N/A"}</td>
                    <td>{request.requesters_car_name || "N/A"}</td>
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
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No maintenance requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100px" }}
      >
        <CustomPagination
          currentPage={currentPage}
          totalPages={Math.ceil(maintenanceRequests.length / itemsPerPage)}
          handlePageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Modal for Viewing Details */}
      {selectedRequest && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div className="d-flex align-items-center">
                  <img
                    src={Logo}
                    alt="Logo"
                    style={{ width: "100px", height: "70px", marginRight: "10px" }}
                  />
                  <h5 className="modal-title">Maintenance Request Details</h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedRequest(null)}
                ><IoClose/></button>
              </div>
              <div className="modal-body">
                <p><strong>Date:</strong> {new Date(selectedRequest.date).toLocaleDateString()}</p>
                <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                <p><strong>Requester Name:</strong> {selectedRequest.requester_name}</p>
                <p><strong>Requester's Car:</strong> {selectedRequest.requesters_car_name}</p>

                <div className="mb-3">
                  <label htmlFor="maintenanceLetter" className="form-label">
                    Maintenance Letter (PDF) <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="maintenanceLetter"
                    accept="application/pdf"
                    onChange={(e) => handleFileChange(e, setMaintenanceLetter)}
                  />
                  {maintenanceLetter && (
                    <button
                      className="btn"
                      onClick={() => window.open(URL.createObjectURL(maintenanceLetter), "_blank")}
                    >
                      <Eye />
                    </button>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="receiptFile" className="form-label">
                    Receipt File (PDF) <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="receiptFile"
                    accept="application/pdf"
                    onChange={(e) => handleFileChange(e, setReceiptFile)}
                  />
                  {receiptFile && (
                    <button
                      className="btn"
                      onClick={() => window.open(URL.createObjectURL(receiptFile), "_blank")}
                    >
                      <Eye />
                    </button>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="maintenanceTotalCost" className="form-label">
                    Total Cost <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="maintenanceTotalCost"
                    value={maintenanceTotalCost}
                    onChange={(e) => setMaintenanceTotalCost(e.target.value)}
                    placeholder="Enter total cost"
                  />
                </div>

                <div className="mb-3">
                  <button
                    className="btn"
                    style={{ backgroundColor: "#181E4B", color: "white",width:"100px" }}
                    onClick={() => handleSubmitFiles(selectedRequest.id)}
                  >
                    Submit
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn"
                  style={{ backgroundColor: "#181E4B", color: "white" }}
                  onClick={() => {
                    if (!maintenanceLetter || !receiptFile || !maintenanceTotalCost) {
                      toast.error("Please upload all required files and provide the total cost before forwarding.");
                      return;
                    }
                    setPendingAction("forward");
                    setShowConfirmModal(true);
                  }}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Processing..." : "Forward"}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    if (!maintenanceLetter || !receiptFile || !maintenanceTotalCost) {
                      toast.error("Please upload all required files and provide the total cost before rejecting.");
                      return;
                    }
                    setShowRejectModal(true);
                  }}
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

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Action</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirmModal(false)}
                ><IoClose/></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to forward this request?</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmAction}
                >
                  Confirm
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
                ><IoClose/></button>
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
                  className="btn btn-secondary"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleRejectAction}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GSmaintenance;
