import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Loader from "../../../utilities/Loader/Loader.utility";
import "./Organizer.details.css";
import "../../../styles/global.styles.css";

const OrganizerDetails = () => {
  const location = useLocation();
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setOrganizer(location.state?.organizer || null);
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

  if (!organizer) {
    return <div className="not-found">No Organizer Found</div>;
  }

  return (
    <section id="organizer-detail">
      <div className="scroll-container">
        <h2 className="organizer-title">Organizer Details</h2>

        <div className="content-container">
          {/* Organizer Profile Picture Section */}
          <div className="organizer-image-container">
            <img
              src={organizer?.organizerProfile?.profilePicture || "/default-avatar.png"}
              alt={organizer.userName}
              className="organizer-image"
              onError={(e) => (e.target.src = "/default-avatar.png")}
            />
          </div>

          {/* Organizer Info Section */}
          <div className="details-container">
            <div className="details-table">
              <div className="detail-row">
                <div className="detail-label">Organizer ID</div>
                <div className="detail-value">
                  #{organizer._id.substring(18, 24).toUpperCase()}
                </div>
                <div className="detail-label">Role</div>
                <div className="detail-value">
                  <span
                    className="role-badge"
                    style={{ backgroundColor: getRoleColor(organizer.role) }}
                  >
                    {organizer.role}
                  </span>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Organizer Name</div>
                <div className="detail-value">{organizer.userName}</div>
                <div className="detail-label">Email</div>
                <div className="detail-value organizer-email">
                  {formatEmail(organizer.email)}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Account Created</div>
                <div className="detail-value">{formatDate(organizer.createdAt)}</div>
                <div className="detail-label">Last Login</div>
                <div className="detail-value">{formatDate(organizer.lastLogin)}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Login Attempts</div>
                <div className="detail-value">{organizer.loginAttempts || 0}</div>
                <div className="detail-label">Account Status</div>
                <div className="detail-value">
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: organizer.lockUntil ? "#FF0000" : "#4CAF50",
                    }}
                  >
                    {organizer.lockUntil ? "Locked" : "Active"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Information Section */}
        <div className="organizer-services-container">
          <h3 className="organizer-services-title">Services Information</h3>
          <div className="services-table">
            <div className="services-header">
              <div className="header-cell">Provided Services</div>
              <div className="header-cell">Service Count</div>
            </div>

            <div className="services-row">
              <div className="services-cell">
                {organizer.organizerProfile?.services?.length > 0 ? (
                  <div className="services-list">
                    {organizer.organizerProfile.services.map((service, index) => (
                      <div key={index} className="service-item">
                        {service}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="no-data">No services provided</span>
                )}
              </div>
              <div className="services-cell">
                <div className="service-count">
                  {organizer.organizerProfile?.services?.length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events Information Section */}
        <div className="organizer-events-container">
          <h3 className="organizer-events-title">Events Information</h3>
          <div className="events-table">
            <div className="events-header">
              <div className="header-cell">Organized Events</div>
              <div className="header-cell">Events Count</div>
            </div>

            <div className="events-row">
              <div className="events-cell">
                {organizer.organizedEvents?.length > 0 ? (
                  <div className="events-list">
                    {organizer.organizedEvents.map((event, index) => (
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
                <div className="event-count">
                  {organizer.organizedEvents?.length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="organizer-additional-container">
          <h3 className="organizer-additional-title">Additional Information</h3>
          <div className="additional-table">
            <div className="additional-header">
              <div className="header-cell">Field</div>
              <div className="header-cell">Value</div>
            </div>

            <div className="additional-row">
              <div className="additional-cell additional-label">Session ID</div>
              <div className="additional-cell additional-value">
                {organizer.sessionId ? (
                  <code className="session-id">
                    {organizer.sessionId.substring(0, 20)}...
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
                {formatDate(organizer.updatedAt)}
              </div>
            </div>

            <div className="additional-row">
              <div className="additional-cell additional-label">Lock Until</div>
              <div className="additional-cell additional-value">
                {organizer.lockUntil ? formatDate(organizer.lockUntil) : "Not Locked"}
              </div>
            </div>

            <div className="additional-row">
              <div className="additional-cell additional-label">Bio</div>
              <div className="additional-cell additional-value">
                {organizer.organizerProfile?.bio || "No bio provided"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrganizerDetails;