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
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f7f9fc;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f7f9fc;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                            <h1 style="color: white; font-size: 28px; margin: 0; font-weight: 700; letter-spacing: 1px;">EVENTIFY</h1>
                            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 8px 0 0 0;">Event Management Platform</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            ${content}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                                &copy; 2024 EVENTIFY. All rights reserved.<br>
                                <span style="font-size: 12px; color: #868e96;">
                                    This email was sent to you as a registered user of EVENTIFY.<br>
                                    If you believe you received this email in error, please contact our support team.
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

  const content = `
    <div style="text-align: center;">
        <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 20px; font-weight: 600;">🎉 New Event Created Successfully!</h2>
        
        <div style="background: linear-gradient(135deg, #f0f4ff 0%, #e6e9ff 100%); padding: 25px; border-radius: 12px; margin-bottom: 25px;">
            <p style="color: #667eea; font-size: 18px; margin: 0; font-weight: 500;">
                Your event "${event.title}" has been created and is now live on EVENTIFY!
            </p>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: left;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Event Details</h3>
            
            <table width="100%" style="border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 120px;">Event Title</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.title}</td>
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
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Date & Time</td>
                    <td style="padding: 8px 0; color: #2d3748;">${eventDate}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Venue</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.venue.name}, ${event.venue.city}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Status</td>
                    <td style="padding: 8px 0; color: #52c41a; font-weight: 600;">${event.status}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; vertical-align: top;">Description</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.description}</td>
                </tr>
            </table>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; color: #667eea; margin-bottom: 8px;">📊</div>
                <p style="margin: 0; color: #4a5568; font-size: 14px; font-weight: 600;">Manage Event</p>
                <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 12px;">Update details, tickets, and more</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; color: #667eea; margin-bottom: 8px;">👥</div>
                <p style="margin: 0; color: #4a5568; font-size: 14px; font-weight: 600;">Track Attendees</p>
                <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 12px;">Monitor registrations and sales</p>
            </div>
        </div>
        
        <div style="background: #f0f4ff; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
            <p style="margin: 0; color: #667eea; font-size: 14px; text-align: center;">
                <strong>Next Steps:</strong> Promote your event, manage ticket sales, and track attendance through your EVENTIFY dashboard.
            </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/events/${event._id}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; margin-right: 15px;">
                View Event
            </a>
            <a href="${process.env.FRONTEND_URL}/events/${event._id}/manage" style="background: #ffffff; color: #667eea; padding: 12px 24px; text-decoration: none; border-radius: 6px; border: 1px solid #667eea; font-weight: 600; display: inline-block;">
                Manage Event
            </a>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 25px;">
            <p style="margin: 0; color: #6c757d; font-size: 13px; text-align: center;">
                Created by: ${creatorName}<br>
                Need help managing your event? Contact our support team anytime.
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

/**
 * @function sendEventPublishedEmail
 * @description Sends email notification when an event is published
 */
exports.sendEventPublishedEmail = async (toEmail, event) => {
  const eventDate = new Date(event.dateTime.start).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const content = `
    <div style="text-align: center;">
        <h2 style="color: #52c41a; font-size: 24px; margin-bottom: 20px; font-weight: 600;">🚀 Your Event is Now Live!</h2>
        
        <div style="background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%); padding: 25px; border-radius: 12px; margin-bottom: 25px;">
            <p style="color: #52c41a; font-size: 18px; margin: 0; font-weight: 500;">
                Great news! "${event.title}" is now published and visible to attendees.
            </p>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Event Overview</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: center;">
                <div style="background: #f0f4ff; padding: 15px; border-radius: 8px;">
                    <div style="font-size: 20px; color: #667eea; margin-bottom: 8px;">📅</div>
                    <p style="margin: 0; color: #4a5568; font-size: 14px; font-weight: 600;">Event Date</p>
                    <p style="margin: 5px 0 0 0; color: #667eea; font-size: 12px;">${eventDate}</p>
                </div>
                
                <div style="background: #f0f4ff; padding: 15px; border-radius: 8px;">
                    <div style="font-size: 20px; color: #667eea; margin-bottom: 8px;">📍</div>
                    <p style="margin: 0; color: #4a5568; font-size: 14px; font-weight: 600;">Location</p>
                    <p style="margin: 5px 0 0 0; color: #667eea; font-size: 12px;">${event.venue.city}</p>
                </div>
            </div>
        </div>
        
        <div style="background: #e6f7ff; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
            <p style="margin: 0; color: #1890ff; font-size: 14px; text-align: center;">
                <strong>Promotion Tip:</strong> Share your event on social media and with your network to maximize attendance!
            </p>
        </div>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/events/${event._id}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                View Public Event Page
            </a>
        </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: `Event Published: ${event.title} is Now Live!`,
    html: getEmailTemplate(content, "Event Published"),
  });
};
