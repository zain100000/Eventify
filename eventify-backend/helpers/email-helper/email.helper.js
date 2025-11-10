const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * @function sendEmail
 * @description Sends an email using the configured transporter.
 */
const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"EVENTIFY" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error("Failed to send email:", err.message);
    return false;
  }
};

/**
 * @function getEmailTemplate
 * @description Generates a professional HTML email template with a header, body, and footer.
 */
const getEmailTemplate = (content, title = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background-color: #f5f7fa; color: #2d3748;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f7fa;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background: #ffffff; border-radius: 14px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: #8E0400; border-bottom: 1px solid #f0f0f0; text-align: center; padding: 32px 20px;">
              <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1762770676/Eventify/logo/logo_cxqnt4.png" alt="EVENTIFY" style="width: 120px; height: auto; margin-bottom: 8px;" />
              <h1 style="font-size: 22px; font-weight: 700; color: #1a202c; letter-spacing: 0.5px; margin: 10px 0 0 0;">EVENTIFY</h1>
              <p style="color: #718096; font-size: 14px; margin: 6px 0 0 0;">Your trusted event management companion</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #edf2f7;">
              <p style="margin: 0; color: #718096; font-size: 13px; line-height: 1.6;">
                &copy; ${new Date().getFullYear()} EVENTIFY. All rights reserved.<br>
                <span style="font-size: 12px; color: #a0aec0;">
                  You received this email as part of your EVENTIFY account activity.<br>
                  If you didn’t expect this email, please contact support immediately.
                </span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * @function getOtpEmail
 * @description Generates a styled OTP (One-Time Password) email using the common template.
 */
exports.sendOTPEmail = async (toEmail, otp) => {
  const content = `
    <div style="text-align: center;">
        <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 20px; font-weight: 600;">Secure Verification Code</h2>
        <p style="color: #4a5568; line-height: 1.6; margin-bottom: 25px;">
            For your security, we require verification to complete this action. Please use the following One-Time Password (OTP) to proceed:
        </p>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin: 25px 0; display: inline-block;">
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center;">${otp}</div>
        </div>
        
        <p style="color: #e53e3e; font-size: 14px; margin: 20px 0;">
            ⚠️ This code will expire in 5 minutes. Do not share it with anyone.
        </p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 25px;">
            <p style="margin: 0; color: #6c757d; font-size: 13px;">
                If you did not request this verification, please immediately secure your account by changing your password and contact our support team.
            </p>
        </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: "Your EVENTIFY Verification Code",
    html: getEmailTemplate(content, "Secure Verification"),
  });
};

/**
 * @function getPasswordResetEmail
 * @description Generates the email template for password reset instructions.
 */
exports.sendPasswordResetEmail = async (toEmail, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const content = `
    <div style="text-align: center;">
        <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 20px; font-weight: 600;">Password Reset Request</h2>
        <p style="color: #4a5568; line-height: 1.6; margin-bottom: 25px;">
            We received a request to reset your EVENTIFY account password. Click the button below to create a new password:
        </p>
        
        <div style="margin: 30px 0;">
            <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                Reset My Password
            </a>
        </div>
        
        <p style="color: #718096; font-size: 14px; margin: 20px 0;">
            This password reset link is valid for 1 hour. If you did not request a password reset, please ignore this email.
        </p>

         <p style="color: #718096; font-size: 14px; margin: 20px 0;">
            ${resetToken}
        </p>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: "Reset Your EVENTIFY Password",
    html: getEmailTemplate(content, "Password Reset"),
  });
};

/**
 * @function sendEventCreatedEmail
 * @description Sends email notification when a new event is created
 */
exports.sendEventCreatedEmail = async (toEmail, event, creatorName) => {
  const eventDate = new Date(event.dateTime.start).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const eventEndDate = new Date(event.dateTime.end).toLocaleDateString(
    "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  // Get primary image if exists
  const primaryImage =
    event.eventImage.find((img) => img.isPrimary) || event.eventImage[0];
  const imageHtml = primaryImage
    ? `
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="${primaryImage.url}" alt="${event.title}" style="max-width: 100%; height: auto; border-radius: 8px; max-height: 200px; object-fit: cover;">
    </div>
  `
    : "";

  // Ticket configuration info
  const ticketInfo =
    event.ticketConfig &&
    event.ticketConfig.ticketTypes &&
    event.ticketConfig.ticketTypes.length > 0
      ? `
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h4 style="color: #2d3748; margin: 0 0 10px 0; font-weight: 600;">Ticket Information</h4>
      ${event.ticketConfig.ticketTypes
        .map(
          (ticket) => `
        <p style="margin: 5px 0; color: #4a5568;">
          <strong>${ticket.name}:</strong> $${ticket.price} (${ticket.quantity - ticket.sold} available)
        </p>
      `
        )
        .join("")}
      ${
        event.ticketConfig.isRegistrationRequired
          ? '<p style="margin: 5px 0; color: #667eea; font-weight: 600;">✓ Registration Required</p>'
          : '<p style="margin: 5px 0; color: #667eea; font-weight: 600;">✓ Open Attendance</p>'
      }
    </div>
  `
      : `
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <p style="margin: 0; color: #4a5568; text-align: center;">
        ${
          event.ticketConfig.isRegistrationRequired
            ? "Registration required for this event"
            : "Open attendance - no registration required"
        }
      </p>
    </div>
  `;

  const content = `
    <div style="text-align: center;">
        <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 20px; font-weight: 600;">🎉 Event Created Successfully!</h2>
        
        <div style="background: linear-gradient(135deg, #f0f4ff 0%, #e6e9ff 100%); padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <p style="color: #667eea; font-size: 18px; margin: 0; font-weight: 500;">
                "${event.title}" has been created successfully!
            </p>
        </div>

        ${imageHtml}
        
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: left;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Event Details</h3>
            
            <table width="100%" style="border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 120px;">Title</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.title}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Description</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.description}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Category</td>
                    <td style="padding: 8px 0; color: #2d3748;">
                        <span style="background: #667eea; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                            ${event.category}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Type</td>
                    <td style="padding: 8px 0; color: #2d3748;">
                        <span style="background: #764ba2; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                            ${event.type}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Date & Time</td>
                    <td style="padding: 8px 0; color: #2d3748;">
                        ${eventDate}<br>
                        <small style="color: #6c757d;">Ends at ${eventEndDate}</small>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Venue</td>
                    <td style="padding: 8px 0; color: #2d3748;">
                        <strong>${event.venue.name}</strong><br>
                        ${event.venue.address}, ${event.venue.city}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Status</td>
                    <td style="padding: 8px 0;">
                        <span style="color: ${
                          event.status === "PUBLISHED"
                            ? "#52c41a"
                            : event.status === "DRAFT"
                              ? "#fa8c16"
                              : event.status === "CANCELLED"
                                ? "#f5222d"
                                : "#1890ff"
                        }; font-weight: 600;">
                          ${event.status}
                        </span>
                    </td>
                </tr>
                ${
                  event.isFeatured
                    ? `
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Featured</td>
                    <td style="padding: 8px 0; color: #52c41a; font-weight: 600;">⭐ Yes</td>
                </tr>
                `
                    : ""
                }
            </table>
        </div>

        ${ticketInfo}
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; color: #667eea; margin-bottom: 8px;">📊</div>
                <p style="margin: 0; color: #4a5568; font-size: 14px; font-weight: 600;">Manage Event</p>
                <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 12px;">Update details & tickets</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; color: #667eea; margin-bottom: 8px;">👥</div>
                <p style="margin: 0; color: #4a5568; font-size: 14px; font-weight: 600;">Track Attendees</p>
                <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 12px;">Monitor registrations</p>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 25px;">
            <a href="${process.env.FRONTEND_URL}/events/manage/${event._id}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; margin-right: 10px;">
                Manage Event
            </a>
            <a href="${process.env.FRONTEND_URL}/events/${event._id}" style="background: #ffffff; color: #667eea; padding: 12px 24px; text-decoration: none; border-radius: 6px; border: 1px solid #667eea; font-weight: 600; display: inline-block;">
                View Event
            </a>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 25px;">
            <p style="margin: 0; color: #6c757d; font-size: 13px; text-align: center;">
                Created by: ${creatorName}<br>
                Event ID: ${event._id}<br>
                Need assistance? Contact EVENTIFY support.
            </p>
        </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: `Event Created: ${event.title}`,
    html: getEmailTemplate(content, "Event Created Successfully"),
  });
};
