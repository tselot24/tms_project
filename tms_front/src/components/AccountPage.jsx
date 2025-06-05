import React, { useState, useEffect } from "react";
import axios from "axios";
import { ENDPOINTS } from "../utilities/endpoints";
import CustomPagination from "./CustomPagination";
const AccountPage = () => {
  const itemsPerPage = 5;
  const [accounts, setAccounts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roleMappings, setRoleMappings] = useState({});
  const [editAccount, setEditAccount] = useState(null);
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
  }); 
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError("Unauthorized. Please log in.");
      setIsLoading(false);
      return;
    }
  
    try {
      const response = await axios.get(ENDPOINTS.APPROVED_USERS, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("Fetched Users:", response.data);
  
      const filteredAccounts = response.data.filter(user => user.role !== 7);
      filteredAccounts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
      setAccounts(filteredAccounts);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load approved users.");
      setIsLoading(false);
    }
  };
  
  const fetchDepartments = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Unauthorized. Please log in.");
      return;
    }
  
    try {
      const response = await axios.get(ENDPOINTS.DEPARTMENT_LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("Fetched Departments:", response.data); 
  
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setError("Failed to load departments.");
    }
  };
  const fetchRoles = async () => {
    const roleData = {
      1: "Employee",
      2: "Department Manager",
      3: "Finance Manager",
      4: "Transport Manager",
      5: "CEO",
      6: "Driver",
      7: "System Admin",
      8: "General System Excuter", 
      9: "Budget Manager",
    };
    setRoleMappings(roleData);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageAccounts = accounts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(accounts.length / itemsPerPage);

  const handleToggleStatus = async (id, isActive) => {
    const token = localStorage.getItem('authToken');
    const endpoint = isActive
      ? ENDPOINTS.DEACTIVATE_USER(id)
      : ENDPOINTS.ACTIVATE_USER(id);

    try {
      await axios.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update the UI without refetching the entire list
      setAccounts((prevAccounts) =>
        prevAccounts.map((acc) =>
          acc.id === id ? { ...acc, is_active: !isActive } : acc
        )
      );
    } catch (error) {
      setError("Failed to update status.");
    }
  };

  const handleEdit = (account) => {
    setEditAccount(account);
    setFormValues({
      name: account.full_name,
      email: account.email,
      phone: account.phone,
      role: account.role,
      department: account.department,
    });
  };

  const handleSaveEdit = async () => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.patch(
        ENDPOINTS.UPDATE_ROLE(editAccount.id),
        { role: formValues.role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedAccounts = accounts.map((acc) =>
        acc.id === editAccount.id
          ? { ...acc, role: formValues.role } 
          : acc
      );

      setAccounts(updatedAccounts);
      setEditAccount(null);
    } catch (error) {
      setError("Failed to update role.");
    }
  };

  const handleCancelEdit = () => {
    setEditAccount(null); // Cancel the editing mode
  };

  const handleRoleChange = (e) => {
    setFormValues({ ...formValues, role: e.target.value });
  };

  const handleNextPage = () => {
    if (currentPage * itemsPerPage < accounts.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="d-flex mt-5" style={{ minHeight: "100vh", backgroundColor: "#f8f9fc" }}>
      <div className="flex-grow-1 mt-2">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h5">Account Management</h2>
          <div className="d-flex align-items-center">
          </div>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="container py-4">
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
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(currentPageAccounts) && currentPageAccounts.length > 0 ? (
                        currentPageAccounts.map((acc, index) => (
                          <tr key={acc.id}>
                            <td>{(currentPage - 1) * itemsPerPage + index + 1}</td> {/* Adjust numbering */}
                            <td>{acc.full_name}</td>
                            <td>{acc.email}</td>
                            <td>
                              {editAccount && editAccount.id === acc.id ? (
                                <select
                                  className="form-control"
                                  value={formValues.role}
                                  onChange={handleRoleChange}
                                >
                                  {Object.keys(roleMappings).map((roleId) => (
                                    <option key={roleId} value={roleId}>
                                      {roleMappings[roleId]}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                roleMappings[acc.role]
                              )}
                            </td>
                            <td>
                              {departments.length > 0
                                ? departments.find((dep) => dep.id === acc.department)?.name ||
                                  "No Department"
                                : "Loading..."}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  acc.is_active ? "bg-success" : "bg-secondary"
                                }`}
                              >
                                {acc.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td>
                              {editAccount && editAccount.id === acc.id ? (
                                <>
                                  <button
                                    style={{ backgroundColor: "#0b455b", color: "#fff" }}
                                    className="btn btn-sm me-2"
                                    onClick={handleSaveEdit}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={handleCancelEdit}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button
                                  style={{ backgroundColor: "#0b455b", color: "#fff" }}
                                  className="btn btn-sm me-2"
                                  onClick={() => handleEdit(acc)}
                                >
                                  Edit
                                </button>
                              )}
                              <button
                                className={`btn btn-sm ${
                                  acc.is_active ? "btn-danger" : "btn-success"
                                }`}
                                onClick={() => handleToggleStatus(acc.id, acc.is_active)}
                              >
                                {acc.is_active ? "Deactivate" : "Activate"}
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center">
                            No accounts found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

<div
  className="d-flex justify-content-center align-items-center"
  // Full viewport height
>
  <CustomPagination
    currentPage={currentPage}
    totalPages={totalPages}
    handlePageChange={handlePageChange}
  />
</div>
      </div>
    </div>
  );
};

export default AccountPage;