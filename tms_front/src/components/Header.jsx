import React, { useState, useEffect } from "react";
import { FaSignOutAlt, FaArrowLeft, FaTimes } from "react-icons/fa";
import { MdAccountCircle } from "react-icons/md";
import { IoIosNotificationsOutline } from "react-icons/io";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ENDPOINTS } from "../utilities/endpoints";

const Header = ({ role, userId, onResubmit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    password: "",
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigate = useNavigate();
  const fetchCurrentUser = () => {
    axios
      .get(ENDPOINTS.CURRENT_USER, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      })
      .then((response) => {
        const user = response.data;
        console.log("Current user fetched:", user);
        setRole(user.role); // Set the user's role
      })
      .catch((error) => console.error("Error fetching current user:", error));
  };

  useEffect(() => {
      fetchCurrentUser();
    fetchNotifications();
    fetchUnreadCount();
  }, [userId]);

  const fetchNotifications = () => {
    axios
      .get(ENDPOINTS.REQUEST_NOTIFICATIONS, {
        params: { unread_only: false },
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      })
      .then((response) => {
        console.log("Notifications fetched:", response.data);
        setNotifications(response.data.results);
        setUnreadCount(response.data.unread_count);
      })
      .catch((error) => console.error("Error fetching notifications:", error));
  };

  const fetchUnreadCount = () => {
    axios
      .get(ENDPOINTS.UNREADOUNT, {
        params: { user_id: userId },
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      })
      .then((response) => {
        console.log("Unread count fetched:", response.data);
        setUnreadCount(response.data.unread_count);
      })
      .catch((error) => console.error("Error fetching unread count:", error));
  };

  const handleNotificationClick = () => {
    if (!showNotifications) {
      fetchNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const markAllNotificationsAsRead = () => {
    axios
      .post(
        ENDPOINTS.MARKALL_READ,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      )
      .then(() => {
        setUnreadCount(0);
        fetchNotifications();
      })
      .catch((error) => console.error("Error marking notifications as read:", error));
  };

  const handleCloseNotifications = () => {
    markAllNotificationsAsRead();
    setShowNotifications(false);
  };

  const handleResubmit = (requestId) => {
    onResubmit(requestId); // Call the parent's resubmit function
    setShowNotifications(false); // Close notifications
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await axios.post(ENDPOINTS.LOGOUT, { refresh: refreshToken });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refresh_token");
      navigate("/");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    axios
      .put(ENDPOINTS.USER_DETAIL, formData)
      .then(() => {
        console.log("Profile updated successfully");
        setIsEditing(false);
      })
      .catch((error) => console.error("Error updating profile:", error));
  };

  const renderNotificationContent = (notification) => {
    const notificationDate = new Date(notification.created_at);
    const formattedDate = notificationDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const formattedTime = notificationDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    let notificationClass = "mb-3 p-3 border-bottom";
    if (notification.notification_type === "forwarded") {
      notificationClass += " bg-light";
    } else if (notification.notification_type === "approved") {
      notificationClass += " bg-success bg-opacity-10";
    } else if (notification.notification_type === "rejected") {
      notificationClass += " bg-danger bg-opacity-10";
    } else if (notification.notification_type === "new_maintenance") {
      notificationClass += " bg-warning bg-opacity-10";
    }

    return (
      <div key={notification.id} className={notificationClass}>
        <h6 className="fw-bold mb-1">{notification.title}</h6>
        
        {notification.metadata && (
          <div className="small text-muted">
            {notification.metadata.requester && (
              <div className="d-flex justify-content-between">
                <strong>Requester:</strong> <span>{notification.metadata.requester}</span>
              </div>
            )}
            {notification.metadata.destination && (
              <div className="d-flex justify-content-between">
                <strong>Destination:</strong> <span>{notification.metadata.destination}</span>
              </div>
            )}
            {notification.metadata.passengers && (
              <div className="d-flex justify-content-between">
                <strong>Passengers:</strong> <span>{notification.metadata.passengers}</span>
              </div>
            )}
            {notification.notification_type === "rejected" &&
              notification.metadata.rejection_reason && (
                <div className="d-flex justify-content-between">
                  <strong>Reason:</strong> <span>{notification.metadata.rejection_reason}</span>
                </div>
              )}
          </div>
        )}
        <div className="d-flex justify-content-between align-items-center mt-2">
          <small className="text-muted">
            {formattedDate} at {formattedTime}
          </small>
          {notification.notification_type === "rejected" && notification.metadata.request_id && (
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={() => handleResubmit(notification.metadata.request_id)}
            >
              Resubmit
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-4 shadow-sm">
      <div className="ms-auto d-flex align-items-center position-relative">
        <div className="position-relative">
          <IoIosNotificationsOutline
            size={30}
            className="me-3 cursor-pointer"
            onClick={handleNotificationClick}
            style={{ cursor: "pointer" }}
          />
          {unreadCount > 0 && (
            <span
              onClick={handleNotificationClick}
              className="position-absolute translate-middle badge d-flex align-items-center justify-content-center"
              style={{
                textAlign: "center",
                width: "22px",
                height: "22px",
                top: "7px",
                left: "25px",
                backgroundColor: "red",
                borderRadius: "50%",
                fontSize: "12px",
                color: "white",
                cursor: "pointer",
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>

        {showNotifications && (
          <div
            className="dropdown-menu show position-absolute end-0 mt-2 shadow rounded p-3 bg-white"
            style={{
              zIndex: 1050,
              top: "100%",
              width: "350px",
              maxHeight: "500px",
              overflowY: "auto",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Notifications</h5>
              <FaTimes
                size={20}
                className="cursor-pointer"
                onClick={handleCloseNotifications}
                style={{ cursor: "pointer" }}
              />
            </div>
            {notifications.length > 0 ? (
              notifications.map((notification) => renderNotificationContent(notification))
            ) : (
              <div className="text-center py-3">
                <p className="text-muted">No new notifications</p>
              </div>
            )}
          </div>
        )}

        <div className="user-menu" onClick={() => setIsEditing(!isEditing)}>
          <MdAccountCircle size={32} style={{ cursor: "pointer" }} />
        </div>

        {isEditing && (
          <div
            className="dropdown-menu show position-absolute end-0 mt-2 shadow rounded p-3 bg-white"
            style={{ zIndex: 1050, top: "100%", width: "280px" }}
          >
            <button
              type="button"
              className="btn btn-link text-dark d-flex align-items-center mb-3"
              onClick={() => setIsEditing(false)}
            >
              <FaArrowLeft size={16} className="me-2" />
              <span>Back</span>
            </button>
            <h5 className="mb-3 text-center" style={{ fontSize: "16px" }}>
              Edit Profile
            </h5>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-2">
                <label htmlFor="fullName" className="form-label" style={{ fontSize: "12px" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-2">
                <label htmlFor="phoneNumber" className="form-label" style={{ fontSize: "12px" }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="form-control form-control-sm"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-2">
                <label htmlFor="password" className="form-label" style={{ fontSize: "12px" }}>
                  New Password
                </label>
                <input
                  type="password"
                  className="form-control form-control-sm"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="d-flex justify-content-between mt-3">
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Changes
                </button>
                <button
                  onClick={handleLogout}
                  className="btn btn-link text-danger p-0"
                  style={{ fontSize: "12px" }}
                >
                  <FaSignOutAlt className="me-2" />
                  Logout
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;