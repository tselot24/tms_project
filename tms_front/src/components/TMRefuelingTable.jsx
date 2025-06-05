import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ENDPOINTS } from "../utilities/endpoints";
import { MdOutlineClose } from "react-icons/md"; // Updated import
import { toast, ToastContainer } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import CustomPagination from './CustomPagination';

const TMRefuelingTable = () => {
  const [refuelingRequests, setRefuelingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showFuelCostModal, setShowFuelCostModal] = useState(false); // State for showing the fuel cost modal
  const [fuelType, setFuelType] = useState("Petrol"); // Default to Petrol
  const [fuelCost, setFuelCost] = useState("");
  const [showCalculateModal, setShowCalculateModal] = useState(false); // State for showing the calculate modal
  const [distance, setDistance] = useState("");
  const [fuelPrice, setFuelPrice] = useState("");
  const [fuelEfficiency, setFuelEfficiency] = useState(15); // Default value: 15 km/l
  const [totalCost, setTotalCost] = useState(null); // State to store the calculated total cost

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items per page

  const totalPages = Math.ceil(refuelingRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = refuelingRequests.slice(startIndex, endIndex);

  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

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
      setRefuelingRequests(data.results || []);
    } catch (error) {
      console.error("Error fetching refueling requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestDetail = async (requestId) => {
    const accessToken = localStorage.getItem("authToken");

    if (!accessToken) {
      console.error("No access token found.");
      return;
    }

    try {
      const response = await fetch(ENDPOINTS.REFUELING_REQUEST_DETAIL(requestId), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch refueling request details");
      }

      const requestData = await response.json();
      console.log("Refueling Request Details:", requestData);

      // Fetch vehicle details to get the driver name and fuel efficiency
      const vehicleResponse = await fetch(ENDPOINTS.VEHICLE_DETAIL(requestData.requesters_car), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!vehicleResponse.ok) {
        throw new Error("Failed to fetch vehicle details");
      }

      const vehicleData = await vehicleResponse.json();
      console.log("Vehicle Details:", vehicleData);

      requestData.driver_name = vehicleData.driver_name;
      requestData.fuel_efficiency = parseFloat(vehicleData.fuel_efficiency);

      setSelectedRequest(requestData); 
    } catch (error) {
      console.error("Error fetching refueling request details:", error);
      toast.error("Failed to fetch request details.");
    }
  };

  const fetchVehicleDetails = async (vehicleId) => {
    const accessToken = localStorage.getItem("authToken");

    if (!accessToken) {
      console.error("No access token found.");
      return;
    }

    try {
      const response = await fetch(ENDPOINTS.VEHICLE_DETAIL(vehicleId), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch vehicle details");
      }

      const data = await response.json();
      console.log("Vehicle Details:", data);
      setFuelEfficiency(parseFloat(data.fuel_efficiency)); // Set the fuel efficiency from the vehicle details
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      toast.error("Failed to fetch vehicle details.");
    }
  };

  const handleFuelCostUpdate = async () => {
    const accessToken = localStorage.getItem("authToken");

    if (!accessToken) {
      console.error("No access token found.");
      return;
    }

    if (!fuelCost) {
      toast.error("Please enter the fuel cost.");
      return;
    }

    try {
      const response = await fetch(ENDPOINTS.UPDATE_FUEL_COST, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fuel_type: fuelType,
          fuel_cost: parseFloat(fuelCost),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update fuel cost");
      }

      toast.success(`${fuelType} cost updated successfully!`);
      setShowFuelCostModal(false); // Close the modal after successful update
    } catch (error) {
      console.error("Error updating fuel cost:", error);
      toast.error("Failed to update fuel cost. Please try again.");
    }
  };

  const calculateTotalCost = async (requestId, estimatedDistance, fuelPrice) => {
    const accessToken = localStorage.getItem("authToken");

    if (!accessToken) {
      console.error("No access token found.");
      return;
    }

    if (!estimatedDistance || !fuelPrice) {
      toast.error("Please provide both estimated distance and fuel price.");
      return;
    }

    try {
      const payload = {
        estimated_distance_km: parseFloat(estimatedDistance),
        fuel_price_per_liter: parseFloat(fuelPrice),
      };

      console.log("Payload for calculation:", payload);

      const response = await fetch(ENDPOINTS.REFUELING_REQUEST_ESTIMATE(requestId), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from backend:", errorData);
        throw new Error("Failed to calculate total cost");
      }

      const data = await response.json();
      console.log("Calculation Result:", data);

      // Set the total cost from the backend response
      setTotalCost(data.total_cost.toFixed(2));
      toast.success(`Total cost calculated: ${data.total_cost.toFixed(2)} ETB`);
    } catch (error) {
      console.error("Error calculating total cost:", error);
      toast.error("Failed to calculate total cost. Please try again.");
    }
  };

  // Handle actions (forward, reject)
  const handleAction = async (requestId, action) => {
    const accessToken = localStorage.getItem("authToken");

    if (!accessToken) {
      console.error("No access token found.");
      return;
    }

    setActionLoading(true);
    try {
      const body = { action };

      // Include additional fields for the "forward" action
      if (action === "forward") {
        if (!distance || !fuelPrice) {
          toast.error("Please provide both estimated distance and fuel price.");
          setActionLoading(false);
          return;
        }

        body.estimated_distance_km = parseFloat(distance); // Add estimated distance
        body.fuel_price_per_liter = parseFloat(fuelPrice); // Add fuel price
      }

      if (action === "reject") {
        body.rejection_message = rejectionMessage; // Add rejection message if rejecting
      }

      console.log("Payload being sent to backend:", body); // Debugging

      const response = await fetch(ENDPOINTS.APPREJ_REFUELING_REQUEST(requestId), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body), // Convert the payload to JSON
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from backend:", errorData);
        throw new Error(`Failed to ${action} the refueling request`);
      }

      if (action === "forward") {
        toast.success("Request forwarded successfully!");
      } else if (action === "reject") {
        toast.success("Request rejected successfully!");
      }

      fetchRefuelingRequests(); // Refresh the list after action
      setSelectedRequest(null); // Close the detail view
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      toast.error(`Failed to ${action} the request. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectAction = () => {
    if (rejectionMessage.trim() && selectedRequest) {
      handleAction(selectedRequest.id, "reject");
      setShowRejectModal(false);
    } else {
      toast.error("Rejection message cannot be empty.");
    }
  };

  const handleCalculate = () => {
    if (!distance || !fuelPrice || !fuelEfficiency) {
      toast.error("Please fill in all fields.");
      return;
    }

    // Perform the calculation
    const totalFuelNeeded = distance / fuelEfficiency;
    const totalCost = totalFuelNeeded * fuelPrice;

    // Display the result using a toast notification
    toast.success(`The total fuel cost is ${totalCost.toFixed(2)}.`);

    // Clear the form fields
    setDistance("");
    setFuelPrice("");
    setFuelEfficiency("");

    // Close the modal after calculation
    setShowCalculateModal(false);
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
              {currentRequests.length > 0 ? (
                currentRequests.map((request, index) => (
                  <tr key={request.id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td> {/* Correct numbering */}
                    <td>{new Date(request.created_at).toLocaleDateString()}</td>
                    <td>{request.destination || "N/A"}</td>
                    <td>{request.requester_name || "N/A"}</td>
                    <td>{request.status || "N/A"}</td>
                    <td>
                      <button
                        className="btn btn-sm"
                        style={{ backgroundColor: "#181E4B", color: "white" }}
                        onClick={() => fetchRequestDetail(request.id)} // Fetch and show details
                      >
                        View Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No refueling requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "100px" }}
          >
            <CustomPagination
              currentPage={currentPage}
              totalPages={Math.ceil(refuelingRequests.length / itemsPerPage)}
              handlePageChange={(page) => setCurrentPage(page)}
            />
          </div>
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
                  onClick={() => {
                    setSelectedRequest(null);
                    setTotalCost(null); // Clear the total cost when closing the modal
                  }}
                >
                  <MdOutlineClose />
                </button>
              </div>
              <div className="modal-body">
                <p><strong>Destination:</strong> {selectedRequest.destination}</p>
                <p><strong>Fuel Type:</strong> {selectedRequest.fuel_type}</p>
                <p><strong>Driver:</strong> {selectedRequest.driver_name || "N/A"}</p>
                <div className="mb-3">
                  <label htmlFor="distanceInput" className="form-label">
                    Estimated Distance (in km)
                  </label>
                  <input
                    type="number"
                    id="distanceInput"
                    className="form-control"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="Enter estimated distance in kilometers"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="fuelPriceInput" className="form-label">
                    Fuel Price (per liter)
                  </label>
                  <input
                    type="number"
                    id="fuelPriceInput"
                    className="form-control"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(e.target.value)}
                    placeholder="Enter fuel price per liter"
                  />
                </div>
                {totalCost && (
                  <div className="alert alert-info mt-3">
                    <strong>Total Cost:</strong> {totalCost} ETB
                  </div>
                )}
              </div>
              <div className="modal-footer">
                {!totalCost ? (
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      calculateTotalCost(selectedRequest.id, distance, fuelPrice)
                    }
                  >
                    Calculate Total
                  </button>
                ) : (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => handleAction(selectedRequest.id, "forward")}
                    >
                      Forward
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => setShowRejectModal(true)}
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedRequest(null);
                    setTotalCost(null); // Clear the total cost when closing the modal
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calculate Modal */}
      {showCalculateModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Calculate Fuel Cost</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowCalculateModal(false);
                    setTotalCost(null); // Clear the total cost when closing the modal
                  }}
                >
                  <MdOutlineClose />
                </button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="distanceInput" className="form-label">
                    Estimated Distance (in km)
                  </label>
                  <input
                    type="number"
                    id="distanceInput"
                    className="form-control"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="Enter estimated distance in kilometers"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="fuelPriceInput" className="form-label">
                    Fuel Price (per liter)
                  </label>
                  <input
                    type="number"
                    id="fuelPriceInput"
                    className="form-control"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(e.target.value)}
                    placeholder="Enter fuel price per liter"
                  />
                </div>
                {totalCost && (
                  <div className="alert alert-info mt-3">
                    <strong>Total Cost:</strong> The total cost to go from the Ministry of Innovation and Technology to the destination is <strong>{totalCost} ETB</strong>.
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => calculateTotalAmount(distance, fuelPrice, fuelEfficiency)} // Pass the required parameters
                >
                  Calculate
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCalculateModal(false);
                    setTotalCost(null); // Clear the total cost when closing the modal
                  }}
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
                  <MdOutlineClose />
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
                  onClick={() => {
                    handleAction(selectedRequest.id, "reject");
                    setShowRejectModal(false);
                  }}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Processing..." : "Reject"}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fuel Cost Update Modal */}
      {showFuelCostModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Update Fuel Costs</h4>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowFuelCostModal(false)}
                >
                  <MdOutlineClose />
                </button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="fuelType" className="form-label">
                    Select Fuel Type
                  </label>
                  <select
                    id="fuelType"
                    className="form-select"
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="fuelCost" className="form-label">
                    {fuelType} Cost (per liter)
                  </label>
                  <input
                    type="number"
                    id="fuelCost"
                    className="form-control"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    placeholder={`Enter ${fuelType.toLowerCase()} cost`}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowFuelCostModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleFuelCostUpdate}
                >
                  Update Cost
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TMRefuelingTable;
