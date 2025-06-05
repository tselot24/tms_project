import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast, ToastContainer } from "react-toastify"; // For toast messages
import "react-toastify/dist/ReactToastify.css";
import Logo from "../assets/Logo.jpg"; // Import the logo image
import { IoMdClose } from "react-icons/io";
import { ENDPOINTS } from "../utilities/endpoints";
import CustomPagination from './CustomPagination';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { IoClose } from "react-icons/io5";

const TMhighcostrequests = () => {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]); // State for employees
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null); // Selected request for modal
  const [rejectionReason, setRejectionReason] = useState(""); // State for rejection reason
  const [showRejectionModal, setShowRejectionModal] = useState(false); // State for rejection modal
  const [showConfirmation, setShowConfirmation] = useState(false); // State for rejection confirmation dialog
  const [showApproveConfirmation, setShowApproveConfirmation] = useState(false); // State for approve confirmation dialog
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items per page
  const [availableVehicles, setAvailableVehicles] = useState([]); // State for available vehicles
  const [selectedVehicleId, setSelectedVehicleId] = useState(""); // Initialize with an empty string
  const [estimatedDistance, setEstimatedDistance] = useState(""); // State for estimated distance
  const [fuelPrice, setFuelPrice] = useState(""); // State for fuel price per liter
  const [isCostCalculated, setIsCostCalculated] = useState(false); // State to track cost calculation
  const [showEstimateModal, setShowEstimateModal] = useState(false); // State for estimate modal

  const accessToken = localStorage.getItem("authToken");
  useEffect(() => {
    fetchRequests();
    fetchUsers(); 
    fetchAvailableVehicles(); // Fetch available vehicles
  }, []);

  const fetchRequests = async () => {
    if (!accessToken) {
      console.error("No access token found.");
      return;
    }

    setLoading(true);
    try {
      // Fetch high-cost requests
      const highCostRequests = await fetchHighCostRequests();

      // Add a "requestType" property to high-cost requests
      const highCostRequestsWithLabel = highCostRequests.map((request) => ({
        ...request,
        requestType: "High Cost", // Label as high-cost
      }));

      console.log("High-Cost Requests:", highCostRequestsWithLabel); // Debugging log
      setRequests(highCostRequestsWithLabel); // Set high-cost requests to state
    } catch (error) {
      console.error("Fetch Requests Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!accessToken) {
      console.error("No access token found.");
      return;
    }

    try {
      const response = await fetch(ENDPOINTS.USER_LIST, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      setUsers(data.results || []); // Set users data
    } catch (error) {
      console.error("Fetch Users Error:", error);
    }
  };

  const fetchHighCostRequests = async () => {
    if (!accessToken) {
      console.error("No access token found.");
      return [];
    }

    try {
      const response = await fetch(ENDPOINTS.HIGH_COST_LIST, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch high-cost transport requests");

      const data = await response.json();
      console.log("High-Cost Requests:", data.results); // Debugging log
      return data.results || []; // Return fetched high-cost requests
    } catch (error) {
      console.error("Fetch High-Cost Requests Error:", error);
      return [];
    }
  };

  const fetchAvailableVehicles = async () => {
    if (!accessToken) {
      console.error("No access token found.");
      return;
    }

    try {
      const response = await fetch(ENDPOINTS.AVAILABLE_VEHICLES, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch available vehicles");

      const data = await response.json();
      setAvailableVehicles(data.results || []); // Set available vehicles
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Failed to fetch available vehicles.");
    }
  };

  const fetchHighCostDetails = async (requestId) => {
    if (!accessToken) {
      console.error("No access token found.");
      return;
    }

    try {
      const response = await fetch(ENDPOINTS.HIGH_COST_DETAIL(requestId), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const contentType = response.headers.get("Content-Type");
      if (!response.ok || !contentType.includes("application/json")) {
        const errorText = await response.text(); // Read the error response as text
        console.error("Error Response:", errorText);
        throw new Error("Failed to fetch high-cost request details");
      }

      const data = await response.json();
      setSelectedRequest(data); // Update the modal with fetched details
    } catch (error) {
      console.error("Fetch High-Cost Details Error:", error);
      toast.error("Failed to fetch high-cost request details.");
    }
  };

  // Get employee names from IDs
  const getEmployeeNames = (employeeIds) => {
    return employeeIds
      .map((id) => {
        const employee = users.find((user) => user.id === id);
        return employee ? employee.full_name : "Unknown";
      })
      .join(", ");
  };

  const handleViewDetail = (request) => {
    setSelectedRequest(request);
  };

  const handleCloseDetail = () => {
    setSelectedRequest(null);
    setRejectionReason(""); // Clear rejection reason
    setShowRejectionModal(false); // Close rejection modal
    setShowConfirmation(false); // Close rejection confirmation dialog
    setShowApproveConfirmation(false); // Close approve confirmation dialog
    setIsCostCalculated(false); // Reset cost calculation state
  };

  const handleApproveReject = async (action) => {
    if (!accessToken) {
      console.error("No access token found.");
      return;
    }

    try {
      const response = await fetch(ENDPOINTS.APPREJ_HIGHCOST_REQUEST(selectedRequest.id), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: action, // "forward" or "reject"
          rejection_message: action === "reject" ? rejectionReason : undefined, // Include rejection reason if rejecting
        }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} request`);

      toast.success(`Request ${action === "forward" ? "forwarded" : "rejected"} successfully!`);
      setSelectedRequest(null); // Close the modal
      fetchRequests(); // Refresh the list of requests
    } catch (error) {
      console.error(`${action === "forward" ? "Forward" : "Reject"} Error:`, error);
      toast.error(`Failed to ${action} request.`);
    }
  };

  const estimateCost = async () => {
    if (!selectedVehicleId || !fuelPrice || !estimatedDistance) {
      toast.error("Please provide all required inputs.");
      return;
    }
  
    try {
      const response = await fetch(ENDPOINTS.ESTIMATE_HIGH_COST(selectedRequest.id), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estimated_distance_km: estimatedDistance,
          fuel_price_per_liter: fuelPrice,
          estimated_vehicle_id: selectedVehicleId,
        }),
      });
  
      if (!response.ok) throw new Error("Failed to estimate cost");
  
      toast.success("Cost estimated successfully!");
      setShowEstimateModal(false); // Close the estimate modal
      fetchHighCostDetails(selectedRequest.id); // Refresh details in the first modal
      setIsCostCalculated(true);
    } catch (error) {
      console.error("Estimate Cost Error:", error);
      toast.error("Failed to estimate cost.");
    }
  };

  const assignVehicle = async () => {
    try {
      const response = await fetch(ENDPOINTS.ASSIGN_VEHICLE(selectedRequest.id), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = JSON.parse(errorText).error || "Failed to assign vehicle.";
        toast.error(errorMessage);
        return;
      }
  
      toast.success("Vehicle assigned successfully!");
      fetchHighCostDetails(selectedRequest.id); // Refresh details
    } catch (error) {
      console.error("Assign Vehicle Error:", error);
      toast.error("Failed to assign vehicle.");
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageRequests = requests.slice(startIndex, endIndex);

  return (
    <div className="container mt-4" style={{ minHeight: "100vh", backgroundColor: "#f8f9fc" }}>
      <ToastContainer /> 
      {loading ? (
        <div className="text-center mt-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading data...</p>
        </div>
      ) : (
<div className="table-responsive" style={{ width: "100%", overflowX: "auto" }}>
  <table className="table table-hover align-middle">
    <thead className="table">
      <tr>
        <th>#</th> {/* Add numbering column */}
        <th>Start Day</th>
        <th>Start Time</th>
        <th>Return Day</th>
        <th>Destination</th>
        <th>Request Type</th> {/* Add Request Type column */}
        <th>Status</th>
    
      </tr>
    </thead>
    <tbody>
      {currentPageRequests.length > 0 ? (
        currentPageRequests.map((request, index) => (
          <tr key={request.id}>
            <td>{(currentPage - 1) * itemsPerPage + index + 1}</td> {/* Correct numbering */}
            <td>{request.start_day}</td>
            <td>{request.start_time}</td>
            <td>{request.return_day}</td>
            <td>{request.destination}</td>
            <td>{request.status}</td>
            <td>
              <button
                className="btn btn-sm"
                style={{ backgroundColor: "#181E4B", color: "white" }}
                onClick={() => handleViewDetail(request)}
              >
                View Detail
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="7" className="text-center">
            No transport requests found.
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
          totalPages={Math.ceil(requests.length / itemsPerPage)}
          handlePageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {selectedRequest && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <div
            className="modal-dialog"
            style={{
              width: "90%", // Set the width to 90% of the viewport
              maxWidth: "1200px", // Set a maximum width for larger screens
              margin: "0 auto", // Center the modal horizontally
            }}
          >
            <div className="modal-content">
              <div className="modal-header">
                <div className="d-flex align-items-center">
                  <img
                    src={Logo}
                    alt="Logo"
                    style={{ width: "100px", height: "70px", marginRight: "10px" }}
                  />
                  <h5 className="modal-title">Estimate Cost and Assign Vehicle</h5>
                </div>
                <button type="button" className="btn-close" onClick={handleCloseDetail}>
                  <IoClose size={30} />
                </button>
              </div>
              <div className="modal-body">
                <p><strong>Requester:</strong> {selectedRequest.requester}</p>
                <p><strong>Employees:</strong> {selectedRequest.employees?.join(", ") || "N/A"}</p>
                <p><strong>Start Day:</strong> {selectedRequest.start_day}</p>
                <p><strong>Return Day:</strong> {selectedRequest.return_day}</p>
                <p><strong>Destination:</strong> {selectedRequest.destination}</p>
                <p><strong>Reason:</strong> {selectedRequest.reason}</p>

                {!isCostCalculated && (
                  <Button
                    style={{ color: "#ffffff", backgroundColor: "#1976d2", width: "150px" }} // Blue button
                    onClick={() => setShowEstimateModal(true)}
                  >
                    Estimate Cost
                  </Button>
                )}

                {isCostCalculated && (
                  <>
                    <p><strong>Estimated Vehicle:</strong> {selectedRequest.estimated_vehicle}</p>
                    <p><strong>Estimated Distance (km):</strong> {selectedRequest.estimated_distance_km}</p>
                    <p><strong>Fuel Price per Liter:</strong> {selectedRequest.fuel_price_per_liter}</p>
                    <p><strong>Fuel Needed (Liters):</strong> {selectedRequest.fuel_needed_liters}</p>
                    <p><strong>Total Cost:</strong> {selectedRequest.total_cost} ETB</p>
                    <div className="d-flex justify-content-between mt-4">
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="contained"
                          style={{ color: "#ffffff", backgroundColor: "rgb(26, 72, 118)", width: "150px" }} // Blue button
                          onClick={assignVehicle}
                        >
                          Assign Vehicle
                        </Button>
                        <Button
                          variant="contained"
                          style={{ color: "#ffffff", backgroundColor: "#388e3c", width: "150px" }} // Green button
                          onClick={() => handleApproveReject("forward")}
                        >
                          Forward
                        </Button>
                        <Button
                          variant="contained"
                          style={{ color: "#ffffff", backgroundColor: "#d32f2f", width: "150px" }} // Red button
                          onClick={() => handleApproveReject("reject")}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="contained"
                          style={{ color: "#fff", borderColor: "#388e3c", width: "150px", backgroundColor: "rgb(26, 72, 118)" }} // Orange outlined button
                          onClick={() => setShowEstimateModal(true)}
                        >
                          Recalculate
                        </Button>
                      </Stack>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer"></div>
            </div>
          </div>
        </div>
      )}

      {showEstimateModal && (
        <div className="modal fade show d-block">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Estimate Cost</h5>
                <button className="btn-close" onClick={() => setShowEstimateModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="vehicleSelect" className="form-label">Select Vehicle</label>
                  <select
                    id="vehicleSelect"
                    className="form-select"
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                  >
                    <option value="">Select a vehicle</option>
                    {availableVehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.model} - {vehicle.license_plate}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="fuelPrice" className="form-label">Fuel Price per Liter</label>
                  <input
                    id="fuelPrice"
                    type="number"
                    className="form-control"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="estimatedDistance" className="form-label">Estimated Distance (km)</label>
                  <input
                    id="estimatedDistance"
                    type="number"
                    className="form-control"
                    value={estimatedDistance}
                    onChange={(e) => setEstimatedDistance(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <Stack direction="row" spacing={2}>
                  <Button
                    
                    style={{ color: "#ffffff", backgroundColor: "#1976d2" }} // Blue button
                    onClick={estimateCost}
                  >
                    Calculate
                  </Button>
                  <Button
                    variant="outlined"
                    style={{ color: "#d32f2f", borderColor: "#d32f2f" }} // Red outlined button
                    onClick={() => setShowEstimateModal(false)}
                  >
                    Close
                  </Button>
                </Stack>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectionModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reject Request</h5>
                <button type="button" className="btn-close" onClick={() => setShowRejectionModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="rejectionReason" className="form-label">Rejection Reason</label>
                  <textarea
                    id="rejectionReason"
                    className="form-control"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a reason for rejection"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    style={{ color: "#ffffff", backgroundColor: "#d32f2f" }} // Red button
                    onClick={() => handleApproveReject("reject")}
                  >
                    Submit Rejection
                  </Button>
                  <Button
                    variant="outlined"
                    style={{ color: "#1976d2", borderColor: "#1976d2" }} // Blue outlined button
                    onClick={() => setShowRejectionModal(false)}
                  >
                    Cancel
                  </Button>
                </Stack>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Rejection</h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirmation(false)}>
                  <IoMdClose size={30}/>
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to reject this request?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmation(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={handleConfirmAction}>
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showApproveConfirmation && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Approval</h5>
                <button type="button" className="btn-close" onClick={() => setShowApproveConfirmation(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to forward this request to the transport manager?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowApproveConfirmation(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleConfirmApprove}>
                  Confirm Approval
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default TMhighcostrequests;
