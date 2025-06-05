import React, { useState } from "react";
const TransportHistoryPage = () => {
  const itemsPerPage = 10; // Number of items to display per page

  const [history, setHistory] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "johndoe@example.com",
      role: "User",
      department: "Finance",
      action: "Requested a vehicle",
      date: "2025-01-25",
      status: "Approved",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "janesmith@example.com",
      role: "Manager",
      department: "HR",
      action: "Updated department policies",
      date: "2025-01-26",
      status: "Rejected",
    },
    {
      id: 3,
      name: "John Doe",
      email: "johndoe@example.com",
      role: "User",
      department: "Finance",
      action: "Deactivated account",
      date: "2025-01-27",
      status: "Approved",
    },
    {
      id: 4,
      name: "Alice Brown",
      email: "alice@example.com",
      role: "Manager",
      department: "HR",
      action: "Requested vacation",
      date: "2025-01-28",
      status: "Approved",
    },
    {
      id: 5,
      name: "Tom Harris",
      email: "tom@example.com",
      role: "User",
      department: "Finance",
      action: "Submitted timesheet",
      date: "2025-01-29",
      status: "Rejected",
    },
    {
      id: 6,
      name: "Nancy Green",
      email: "nancy@example.com",
      role: "Manager",
      department: "HR",
      action: "Completed training",
      date: "2025-01-30",
      status: "Approved",
    },
    {
      id: 7,
      name: "Michael White",
      email: "michael@example.com",
      role: "User",
      department: "Finance",
      action: "Requested a vehicle",
      date: "2025-01-31",
      status: "Approved",
    },
    {
      id: 8,
      name: "Chris Blue",
      email: "chris@example.com",
      role: "Manager",
      department: "HR",
      action: "Updated policies",
      date: "2025-02-01",
      status: "Rejected",
    },
    {
      id: 9,
      name: "Olivia Black",
      email: "olivia@example.com",
      role: "User",
      department: "Finance",
      action: "Deactivated account",
      date: "2025-02-02",
      status: "Approved",
    },
    {
      id: 10,
      name: "David Grey",
      email: "david@example.com",
      role: "Manager",
      department: "HR",
      action: "Requested vacation",
      date: "2025-02-03",
      status: "Rejected",
    },
    {
      id: 11,
      name: "Emily Yellow",
      email: "emily@example.com",
      role: "User",
      department: "Finance",
      action: "Submitted report",
      date: "2025-02-04",
      status: "Approved",
    },
    {
      id: 12,
      name: "James Brown",
      email: "james@example.com",
      role: "Manager",
      department: "HR",
      action: "Updated department policies",
      date: "2025-02-05",
      status: "Rejected",
    },
    {
      id: 13,
      name: "Linda Pink",
      email: "linda@example.com",
      role: "User",
      department: "Finance",
      action: "Requested vacation",
      date: "2025-02-06",
      status: "Approved",
    },
    {
      id: 14,
      name: "Jack Black",
      email: "jack@example.com",
      role: "Manager",
      department: "HR",
      action: "Completed training",
      date: "2025-02-07",
      status: "Approved",
    },
    {
      id: 15,
      name: "Sophia White",
      email: "sophia@example.com",
      role: "User",
      department: "Finance",
      action: "Deactivated account",
      date: "2025-02-08",
      status: "Rejected",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1); // Current page number

  // Calculate start and end index for pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageHistory = history.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage * itemsPerPage < history.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8f9fc" }}>

      <div className="flex-grow-1">
        <div className="container py-4">
          <h2 className="h5 mb-4">History</h2>

          <div className="card shadow-sm">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPageHistory.length > 0 ? (
                      currentPageHistory.map((record, index) => (
                        <tr key={record.id}>
                          <td>{startIndex + index + 1}</td>
                          <td>{record.name}</td>
                          <td>{record.email}</td>
                          <td>{record.role}</td>
                          <td>{record.department}</td>
                          <td>{record.date}</td>
                          <td
                            className={
                              record.status === "Approved"
                                ? "text-success fw-bold"
                                : "text-danger fw-bold"
                            }
                          >
                            {record.status}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
                          No history records available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <button
              className="btn btn-secondary btn-sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <small>
              Page {currentPage} of {Math.ceil(history.length / itemsPerPage)}
            </small>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleNextPage}
              disabled={currentPage * itemsPerPage >= history.length}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportHistoryPage;
