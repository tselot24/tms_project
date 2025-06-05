import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "../assets/Logo.jpg"; // Import the logo image
import { ENDPOINTS } from "../utilities/endpoints";
import { toast, ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";
import { FaWindowClose } from "react-icons/fa"; // Import the close icon
import Header from "./Header"; // Import the Header component
import CustomPagination from "./CustomPagination";
const EmployeePage = () => {
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]); // State for user list
  const [currentUser, setCurrentUser] = useState(null); // State for current user
  const [formData, setFormData] = useState({
    startDay: "",
    startTime: "",
    returnDay: "",
    employees: [], // Store employee IDs (numbers)
    employeeName: "", // Store selected employee ID
    destination: "",
    reason: "",
  });
  const [selectedRequest, setSelectedRequest] = useState(null); 
  const [filterStatus, setFilterStatus] = useState(""); // State for filtering by status
  const [sortField, setSortField] = useState(""); // State for sorting field
  const [sortOrder, setSortOrder] = useState("asc"); // State for sorting order
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const itemsPerPage = 5; // Number of items per page

  const accessToken = localStorage.getItem("authToken");

  useEffect(() => {
    fetchRequests();
    fetchUsers();
    fetchCurrentUser(); // Fetch current user
  }, []);

  const fetchRequests = async () => {
    if (!accessToken) {
      console.error("No access token found.");
      return;
    }

    setLoading(true); // Show loading state
    try {
      const response = await fetch(ENDPOINTS.REQUEST_LIST, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch transport requests");

      const data = await response.json();
      setRequests(data.results || []); // Set fetched data to state
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  const fetchCurrentUser = async () => {
    if (!accessToken) {
      console.error("No access token found.");
      return;
    }

    try {
      const response = await fetch(ENDPOINTS.CURRENT_USER, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch current user");

      const data = await response.json();
      setCurrentUser(data);
      console.log("This is the current logged user data:", data);
    } catch (error) {
      console.error("Fetch Current User Error:", error);
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
      console.log("Users:", data);

      const filteredUsers = data.results.filter(
        (user) => user.id !== currentUser?.id // Exclude current user
      );
      setUsers(filteredUsers || []); // Set filtered users to state
    } catch (error) {
      console.error("Fetch Users Error:", error);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddEmployee = () => {
    const selectedEmployeeId = parseInt(formData.employeeName, 10);
    if (!isNaN(selectedEmployeeId) && !formData.employees.includes(selectedEmployeeId)) {
      setFormData((prev) => ({
        ...prev,
        employees: [...prev.employees, selectedEmployeeId], // Add employee ID
        employeeName: "", // Reset the dropdown to "Select an employee"
      }));
    }
  };

  const handleRemoveEmployee = (employeeId) => {
    setFormData((prev) => ({
      ...prev,
      employees: prev.employees.filter((id) => id !== employeeId), // Remove employee ID
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!accessToken) {
      console.error("No access token found.");
      return;
    }
  
    const payload = {
      start_day: formData.startDay,
      return_day: formData.returnDay,
      start_time: `${formData.startTime}:00`,  // Ensure time is formatted correctly
      destination: formData.destination,
      reason: formData.reason,
      employees: formData.employees, // Submit all selected employee IDs
    };
  
    setSubmitting(true);
    try {
      const response = await fetch(ENDPOINTS.CREATE_REQUEST, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) throw new Error("Failed to create transport request");
  
      const responseData = await response.json();
      setRequests((prevRequests) => [responseData, ...prevRequests]);
  
      toast.success("Request submitted! Department manager notified."); // Success toast
  
      fetchNotifications(); // Fetch updated notifications to reflect the new request
  
      // Clear the form after submission
      setFormData({
        startDay: "",
        returnDay: "",
        startTime: "",
        employees: [], // Clear employees field
        employeeName: "",
        destination: "",
        reason: "",
      });
  
      setShowForm(false);
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error("Failed to submit request."); // Error toast
    } finally {
      setSubmitting(false);
    }
  };
  
  // Fetch notifications after submission
  const fetchNotifications = async () => {
    try {
      const response = await fetch(ENDPOINTS.REQUEST_NOTIFICATIONS, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch notifications");
      
      const data = await response.json();
      console.log("Updated notifications:", data.results);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  // Get employee names from IDs
  const getEmployeeNames = (employeeIds) => {
    return employeeIds
      .map((id) => {
        const employee = users.find((user) => user.id === id);
        return employee ? employee.full_name : "Unknown";
      })
      .join(", ");
  };

  // Handle view detail click
  const handleViewDetail = (request) => {
    setSelectedRequest(request);
  };

  // Close detail modal
  const handleCloseDetail = () => {
    setSelectedRequest(null);
  };  

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleResubmit = (requestId) => {
    const requestToEdit = requests.find((request) => request.id === requestId);
    if (requestToEdit) {
      setFormData({
        startDay: requestToEdit.start_day,
        startTime: requestToEdit.start_time.slice(0, 5), // Extract HH:mm
        returnDay: requestToEdit.return_day,
        employees: requestToEdit.employees,
        employeeName: "",
        destination: requestToEdit.destination,
        reason: requestToEdit.reason,
      });
      setShowForm(true); // Open the form
    }
  };

  const filteredRequests = requests.filter((request) => {
    if (filterStatus === "Approved" && request.status !== "Approved") {
      return false;
    }
    if (filterStatus === "Rejected" && request.status !== "Rejected") {
      return false;
    }
    if (filterStatus === "Forward" && request.status !== "Forward") {
      return false;
    }
    return true; // If status is All or no filter is applied, return true
  });

  const sortedRequests = filteredRequests.sort((a, b) => {
    if (!sortField) return 0;
    const valueA = a[sortField]?.toString().toLowerCase();
    const valueB = b[sortField]?.toString().toLowerCase();
    if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
    if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Calculate paginated requests
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = sortedRequests.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate total pages
  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <Header role="employee" userId={currentUser?.id} onResubmit={handleResubmit} />
      <div className="container mt-4" style={{ minHeight: "100vh", backgroundColor: "#f8f9fc" }}>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn mb-3 request"
          style={{ backgroundColor: "#181E4B", color: "#fff" }}
        >
          Request 
        </button>

        {showForm && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content" style={{width:"550px"}}>
                <div className="modal-header d-flex justify-content-center align-items-center">
                  <FaWindowClose
                    style={{
                      cursor: "pointer",
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      fontSize: "1.rem",
                    }}
                    onClick={() => setShowForm(false)}
                  />
                  <h5 className="modal-title d-flex">Transport Request Form</h5>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit} style={{ marginBottom: "-40px", marginTop: "-15px" }}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Start Day:</label>
                        <input
                          type="date"
                          name="startDay"
                          value={formData.startDay}
                          onChange={handleInputChange}
                          className="form-control"
                          min={today}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Start Time:</label>
                        <input
                          type="time"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleInputChange}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Return Day:</label>
                        <input
                          type="date"
                          name="returnDay"
                          value={formData.returnDay}
                          onChange={handleInputChange}
                          className="form-control"
                          min={today}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Destination:</label>
                        <input
                          type="text"
                          name="destination"
                          value={formData.destination}
                          onChange={handleInputChange}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">List of Employees:</label>
                        <select
                          name="employeeName"
                          value={formData.employeeName}
                          onChange={handleInputChange}
                          className="form-control"
                        >
                          <option value="">Select an employee</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.full_name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn mt-2"
                          onClick={handleAddEmployee}
                          style={{ backgroundColor: "#181E4B", color: "#fff" }}
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          className="btn mt-2 ms-2"
                          onClick={() => setFormData((prev) => ({ ...prev, employees: [] }))}
                          style={{ backgroundColor: "#dc3545", color: "#fff" }}
                        >
                          Clear
                        </button>
                        <div className="mt-2 d-flex flex-wrap gap-2">
                          {formData.employees.map((employeeId) => {
                            const employee = users.find((user) => user.id === employeeId);
                            return (
                              <div key={employeeId} className="badge bg-primary d-flex align-items-center">
                                <span>{employee ? employee.full_name : "Unknown"}</span>
                                <button
                                  type="button"
                                  className="btn-close btn-close-white ms-2"
                                  aria-label="Close"
                                  onClick={() => handleRemoveEmployee(employeeId)}
                                ></button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Reason:</label>
                        <textarea
                          name="reason"
                          value={formData.reason}
                          onChange={handleInputChange}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn"
                        style={{ backgroundColor: "#181E4B", color: "#fff" }}
                        disabled={submitting}
                      >
                        {submitting ? "Submitting..." : "Submit"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center mt-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading data...</p>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div>
                <label htmlFor="statusFilter" className="me-2">Filter by Status:</label>
                <select
                  id="statusFilter"
                  value={filterStatus}
                  onChange={handleFilterChange}
                  className="form-select d-inline-block w-auto"
                >
                  <option value="">All</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Forward">Forward</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-bordered mt-4">
                <thead className="table">
                  <tr>
                    <th onClick={() => handleSort("start_day")} style={{ cursor: "pointer" }}>
                      Start Day {sortField === "start_day" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th onClick={() => handleSort("start_time")} style={{ cursor: "pointer" }}>
                      Start Time {sortField === "start_time" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th onClick={() => handleSort("return_day")} style={{ cursor: "pointer" }}>
                      Return Day {sortField === "return_day" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th onClick={() => handleSort("destination")} style={{ cursor: "pointer" }}>
                      Destination {sortField === "destination" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>
                      Status {sortField === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRequests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.start_day}</td>
                      <td>{request.start_time}</td>
                      <td>{request.return_day}</td>
                      <td>{request.destination}</td>
                      <td>{request.status}</td>
                      <td>
                        <button
                          className="btn btn-sm"
                          style={{backgroundColor:"#181E4B",color:"white"}}
                          onClick={() => handleViewDetail(request)}
                        >
                          View Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          </>
        )}

        {selectedRequest && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <img src={Logo} alt="Logo" style={{ width: "100px", height: "70px", marginRight: "10px" }} />
                  <h5 className="modal-title">Transport Request Details</h5>
                  <FaWindowClose
                    style={{
                      cursor: "pointer",
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      fontSize: "1.rem",
                    }}
                    onClick={handleCloseDetail}
                  />
                </div>
                <div className="modal-body">
                  <p><strong>Requester:</strong> {currentUser?.full_name}</p> {/* Moved requester to the top */}
                  <p><strong>Start Day:</strong> {selectedRequest.start_day}</p>
                  <p><strong>Start Time:</strong> {selectedRequest.start_time}</p>
                  <p><strong>Return Day:</strong> {selectedRequest.return_day}</p>
                  <p><strong>Employees:</strong> {getEmployeeNames(selectedRequest.employees)}</p>
                  <p><strong>Destination:</strong> {selectedRequest.destination}</p>
                  <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseDetail}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <ToastContainer /> {/* Add ToastContainer for displaying notifications */} {/* Add ToastContainer for displaying notifications */}
      </div>
    </>
  );
};

export default EmployeePage;