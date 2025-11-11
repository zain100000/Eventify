import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Loader from "../../../utilities/Loader/Loader.utility";
import "./User.details.css";
import "../../../styles/global.styles.css";

const UserDetails = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setUser(location.state?.user || null);
      setLoading(false);
    }, 1000);
  }, [location.state]);

  const getRoleColor = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "#FF6B35"; // Orange Red
      case "ADMIN":
        return "#4169E1"; // Royal Blue
      case "ORGANIZER":
        return "#4CAF50"; // Green
      case "USER":
        return "#6A5ACD"; // Slate Blue
      default:
        return "#808080";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const formatEmail = (email) => {
    if (!email) return "N/A";
    return email;
  };

  if (loading) {
    return (
      <div className="loader-container">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <div className="not-found">No User Found</div>;
  }

  return (
    <section id="user-detail">
      <div className="scroll-container">
        <h2 className="user-title">User Details</h2>

        <div className="content-container">
          {/* User Profile Picture Section */}
          <div className="user-image-container">
            <img
              src={user?.profilePicture || "/default-avatar.png"}
              alt={user.userName}
              className="user-image"
              onError={(e) => (e.target.src = "/default-avatar.png")}
            />
          </div>

          {/* User Info Section */}
          <div className="details-container">
            <div className="details-table">
              <div className="detail-row">
                <div className="detail-label">User ID</div>
                <div className="detail-value">
                  #{user._id.substring(18, 24).toUpperCase()}
                </div>
                <div className="detail-label">Role</div>
                <div className="detail-value">
                  <span
                    className="role-badge"
                    style={{ backgroundColor: getRoleColor(user.role) }}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Username</div>
                <div className="detail-value">{user.userName}</div>
                <div className="detail-label">Email</div>
                <div className="detail-value user-email">
                  {formatEmail(user.email)}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Account Created</div>
                <div className="detail-value">{formatDate(user.createdAt)}</div>
                <div className="detail-label">Last Login</div>
                <div className="detail-value">{formatDate(user.lastLogin)}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Login Attempts</div>
                <div className="detail-value">{user.loginAttempts || 0}</div>
                <div className="detail-label">Account Status</div>
                <div className="detail-value">
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: user.lockUntil ? "#FF0000" : "#4CAF50",
                    }}
                  >
                    {user.lockUntil ? "Locked" : "Active"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events Information Section */}
        <div className="user-events-container">
          <h3 className="user-events-title">Events Information</h3>
          <div className="events-table">
            <div className="events-header">
              <div className="header-cell">Organized Events</div>
              <div className="header-cell">Booked Events</div>
            </div>

            <div className="events-row">
              <div className="events-cell">
                {user.organizedEvents?.length > 0 ? (
                  <div className="events-list">
                    {user.organizedEvents.map((event, index) => (
                      <div key={index} className="event-item">
                        {event.title || `Event ${index + 1}`}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="no-data">No organized events</span>
                )}
              </div>
              <div className="events-cell">
                {user.bookedEvents?.length > 0 ? (
                  <div className="events-list">
                    {user.bookedEvents.map((event, index) => (
                      <div key={index} className="event-item">
                        {event.title || `Event ${index + 1}`}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="no-data">No booked events</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="user-additional-container">
          <h3 className="user-additional-title">Additional Information</h3>
          <div className="additional-table">
            <div className="additional-header">
              <div className="header-cell">Field</div>
              <div className="header-cell">Value</div>
            </div>

            <div className="additional-row">
              <div className="additional-cell additional-label">Session ID</div>
              <div className="additional-cell additional-value">
                {user.sessionId ? (
                  <code className="session-id">
                    {user.sessionId.substring(0, 20)}...
                  </code>
                ) : (
                  "N/A"
                )}
              </div>
            </div>

            <div className="additional-row">
              <div className="additional-cell additional-label">
                Last Updated
              </div>
              <div className="additional-cell additional-value">
                {formatDate(user.updatedAt)}
              </div>
            </div>

            <div className="additional-row">
              <div className="additional-cell additional-label">Lock Until</div>
              <div className="additional-cell additional-value">
                {user.lockUntil ? formatDate(user.lockUntil) : "Not Locked"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserDetails;
