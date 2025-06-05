import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { IoClose } from "react-icons/io5";

const VehicleServices = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formData, setFormData] = useState({ date: "", vehicle_service: "" });
  const [vehicleServices, setVehicleServices] = useState([
    {
      id: 1,
      date: "2025-04",
      vehicle_service: 3000, // Total KM traveled
      status: "Pending",
    },
    {
      id: 2,
      date: "2025-03",
      vehicle_service: 500, // Total KM traveled
      status: "Approved",
    },
  ]);

  // Calculate total kilometers traveled
  const totalKmTraveled = vehicleServices.reduce(
    (total, service) => total + service.vehicle_service,
    0
  );

  // Determine alert color and message based on total kilometers
  let alertColor = "green";
  let alertMessage = "Your vehicle is in good condition.";

  if (totalKmTraveled > 4500) {
    alertColor = "red";
    alertMessage = "Your vehicle needs servicing immediately!";
  } else if (totalKmTraveled > 4000) {
    alertColor = "yellow";
    alertMessage = "Your vehicle is approaching the service threshold.";
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Vehicle Services</h2>

      {/* Total KM Alert */}
      <div
        className="alert d-flex align-items-center justify-content-between"
        style={{
          backgroundColor:
            alertColor === "red"
              ? "#f8d7da"
              : alertColor === "yellow"
              ? "#fff3cd"
              : "#d4edda",
          color:
            alertColor === "red"
              ? "#721c24"
              : alertColor === "yellow"
              ? "#856404"
              : "#155724",
          border:
            alertColor === "red"
              ? "1px solid #f5c6cb"
              : alertColor === "yellow"
              ? "1px solid #ffeeba"
              : "1px solid #c3e6cb",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1rem",
        }}
      >
        <div>
          <strong>Total KM Traveled:</strong> {totalKmTraveled} KM
          <br />
          <span>{alertMessage}</span>
        </div>
      </div>

      <div className="d-flex mb-4">
        <button
          className="btn"
          style={{ width: "300px", backgroundColor: "#181E4B", color: "white" }}
          onClick={() => setShowForm(true)}
        >
          New Vehicle Service
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">New Vehicle Service</h5>
                <button className="btn-close" onClick={() => setShowForm(false)}>
                  <IoClose />
                </button>
              </div>
              <div className="modal-body">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const newService = {
                      id: vehicleServices.length + 1,
                      date: formData.date,
                      vehicle_service: parseInt(formData.vehicle_service, 10),
                      status: "Pending",
                    };
                    setVehicleServices([...vehicleServices, newService]);
                    setFormData({ date: "", vehicle_service: "" });
                    setShowForm(false);
                  }}
                >
                  <div className="mb-3">
                    <label htmlFor="month" className="form-label">
                      Month
                    </label>
                    <input
                      type="month"
                      className="form-control"
                      id="month"
                      name="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="total_km" className="form-label">
                      Total KM Travel in This Month
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="total_km"
                      name="vehicle_service"
                      value={formData.vehicle_service}
                      onChange={(e) =>
                        setFormData({ ...formData, vehicle_service: e.target.value })
                      }
                      placeholder="Enter total KM traveled"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn"
                    style={{ width: "100%", backgroundColor: "#181E4B", color: "white" }}
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="thead-dark">
            <tr>
              <th>#</th>
              <th>Month</th>
              <th>Total KM Travel</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {vehicleServices.map((service, index) => (
              <tr key={service.id}>
                <td>{index + 1}</td>
                <td>{service.date}</td>
                <td>{service.vehicle_service} KM</td>
                <td>{service.status}</td>
                <td>
                  <button
                    className="btn btn-sm"
                    style={{ backgroundColor: "#181E4B", color: "white" }}
                    onClick={() => setSelectedRequest(service)}
                  >
                    View Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Vehicle Service Details</h5>
                <button
                  className="btn-close"
                  onClick={() => setSelectedRequest(null)}
                >
                  <IoClose />
                </button>
              </div>
              <div className="modal-body">
                <p><strong>Month:</strong> {selectedRequest.date}</p>
                <p><strong>Total KM Travel:</strong> {selectedRequest.vehicle_service} KM</p>
                <p><strong>Status:</strong> {selectedRequest.status}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleServices;
