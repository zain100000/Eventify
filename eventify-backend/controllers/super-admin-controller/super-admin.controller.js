/**
 * @fileoverview Controller module for managing Super Admin authentication and profile operations.
 *
 * This file includes:
 * - Super Admin registration with password validation and Cloudinary profile picture upload.
 * - Secure login system with JWT authentication, session tracking, and account lockout on multiple failed attempts.
 * - Retrieval of Super Admin details by ID.
 * - Logout functionality with session invalidation.
 *
 * @module controllers/superAdminController
 * @requires mongoose
 * @requires bcrypt
 * @requires jsonwebtoken
 * @requires ../../models/super-admin-model/super-admin.model
 * @requires ../../utilities/cloudinary-utility/cloudinary.utility
 * @requires ../../helpers/password-helper/password.helper
 * @requires ../../helpers/token-helper/token.helper
 */

const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SuperAdmin = require("../../models/super-admin-model/super-admin.model");
const User = require("../../models/user-model/user.model");
const Event = require("../../models/event-model/event.model");
const TicketBooking = require("../../models/ticket-model/ticket.model");

const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../../utilities/cloudinary-utility/cloudinary.utility");
const {
  passwordRegex,
  hashPassword,
} = require("../../helpers/password-helper/password.helper");
const {
  generateSecureToken,
} = require("../../helpers/token-helper/token.helper");
const {
  sendPasswordResetEmail,
  sendEventStatusUpdatedEmail,
  sendBookingStatusUpdateEmail,
} = require("../../helpers/email-helper/email.helper");

/**
 * @description Controller for SuperAdmin registration
 * @route POST /api/super-admin/signup
 * @access Public
 */
exports.registerSuperAdmin = async (req, res) => {
  let uploadedFileUrl = null;

  try {
    const { userName, email, password } = req.body;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    const existingSuperAdmin = await SuperAdmin.findOne({
      email: email.toLowerCase(),
      role: "SUPERADMIN",
    });

    if (existingSuperAdmin) {
      return res.status(409).json({
        success: false,
        message: "SuperAdmin with this email already exists",
      });
    }

    let userProfileImageUrl = null;
    if (req.files?.profilePicture) {
      const uploadResult = await uploadToCloudinary(
        req.files.profilePicture[0],
        "profilePicture"
      );
      userProfileImageUrl = uploadResult.url;
      uploadedFileUrl = uploadResult.url;
    }

    const hashedPassword = await hashPassword(password);

    const superAdmin = new SuperAdmin({
      profilePicture: userProfileImageUrl,
      userName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "SUPERADMIN",
      isSuperAdmin: true,
      isActive: true,
      createdAt: new Date(),
      lastLogin: null,
      loginAttempts: 0,
      lockUntil: null,
    });

    await superAdmin.save();

    res.status(201).json({
      success: true,
      message: "SuperAdmin created successfully",
    });
  } catch (error) {
    if (uploadedFileUrl) {
      try {
        await deleteFromCloudinary(uploadedFileUrl);
      } catch (cloudErr) {
        console.error("Failed to rollback Cloudinary upload:", cloudErr);
      }
    }

    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({
        success: false,
        message: "SuperAdmin with this email already exists",
      });
    }

    console.error("Error creating super admin:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @description Controller for SuperAdmin login
 * @route POST /api/super-admin/signin
 * @access Public
 */
exports.loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    let superadmin = await SuperAdmin.findOne({ email });

    if (!superadmin) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (superadmin.lockUntil && superadmin.lockUntil > Date.now()) {
      const remaining = Math.ceil((superadmin.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account locked. Try again in ${remaining} minutes.`,
      });
    }

    if (superadmin.lockUntil && superadmin.lockUntil <= Date.now()) {
      await SuperAdmin.updateOne(
        { _id: superadmin._id },
        { $set: { loginAttempts: 0, lockUntil: null } }
      );
      superadmin.loginAttempts = 0;
      superadmin.lockUntil = null;
    }

    const isMatch = await bcrypt.compare(password, superadmin.password);

    if (!isMatch) {
      const updated = await SuperAdmin.findOneAndUpdate(
        { _id: superadmin._id },
        { $inc: { loginAttempts: 1 } },
        { new: true }
      );

      if (updated.loginAttempts >= 3) {
        const lockTime = Date.now() + 30 * 60 * 1000;
        await SuperAdmin.updateOne(
          { _id: superadmin._id },
          { $set: { lockUntil: lockTime } }
        );
        return res.status(423).json({
          success: false,
          message:
            "Too many failed login attempts. Account locked for 30 minutes.",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        attempts: updated.loginAttempts,
      });
    }

    const sessionId = generateSecureToken();
    const updatedUser = await SuperAdmin.findOneAndUpdate(
      { _id: superadmin._id },
      {
        $set: {
          loginAttempts: 0,
          lockUntil: null,
          lastLogin: new Date(),
          sessionId,
        },
      },
      { new: true }
    );

    const payload = {
      role: "SUPERADMIN",
      user: { id: updatedUser.id, email: updatedUser.email },
      sessionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { algorithm: "HS256" },
      (err, token) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "Error generating token" });
        }

        res.cookie("accessToken", token, {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 60 * 60 * 1000,
        });

        res.json({
          success: true,
          message: "Super Admin login successfully!",
          superAdmin: {
            id: updatedUser.id,
            userName: updatedUser.userName,
            email: updatedUser.email,
          },
          token,
          expiresIn: 3600,
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

/**
 * @description Controller to get SuperAdmin by ID
 * @route GET /api/super-admin/get-superadmin/:superAdminId
 * @access Private (SuperAdmin)
 */
exports.getSuperAdminById = async (req, res) => {
  try {
    const { superAdminId } = req.params;

    const superAdmin = await SuperAdmin.findById(superAdminId).select(
      "-password -__v -refreshToken"
    );
    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Super Admin fetched successfully",
      superAdmin: superAdmin,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/**
 * @description Controller for SuperAdmin logout
 * @route POST /api/super-admin/logout
 * @access Private (SuperAdmin)
 */
exports.logoutSuperAdmin = async (req, res, next) => {
  try {
    if (req.user && req.user.id) {
      await SuperAdmin.findByIdAndUpdate(req.user.id, {
        $set: { sessionId: generateSecureToken() },
      });
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "strict",
    });

    res.status(201).json({
      success: true,
      message: "Logout Successfully!",
    });
  } catch (err) {
    console.error("Error Logging Out:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Controller for forgot password - Send reset link to email
 * @route POST /api/super-admin/forgot-password
 * @access Public
 * @access Public
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const superAdmin = await SuperAdmin.findOne({ email: email.toLowerCase() });

    if (!superAdmin) {
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000;

    superAdmin.passwordResetToken = resetToken;
    superAdmin.passwordResetExpires = resetTokenExpiry;
    await superAdmin.save();

    const emailSent = await sendPasswordResetEmail(email, resetToken);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email",
      });
    }

    res.status(200).json({
      success: true,
      message: "Link sent successfully! Please check your email",
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @description Controller to reset password with token
 * @route POST /api/super-admin/reset-password/:token
 * @access Public
 */
exports.resetPasswordWithToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    const superAdmin = await SuperAdmin.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!superAdmin) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const isSameAsCurrent = await bcrypt.compare(
      newPassword,
      superAdmin.password
    );
    if (isSameAsCurrent) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as the current password",
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    superAdmin.password = hashedPassword;
    superAdmin.passwordResetToken = null;
    superAdmin.passwordResetExpires = null;
    superAdmin.passwordChangedAt = new Date();
    superAdmin.sessionId = generateSecureToken();

    await superAdmin.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @description Controller to verify reset token validity
 * @route GET /api/super-admin/verify-reset-token/:token
 * @access Public
 */
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const superAdmin = await SuperAdmin.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!superAdmin) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    res.status(200).json({
      success: true,
      message: "Valid reset token",
    });
  } catch (error) {
    console.error("Error verifying reset token:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @description Update event status (SUPERADMIN only)
 * @route PATCH /api/super-admin/event/update-event-status/:eventId
 * @access SUPERADMIN
 */
exports.updateEventStatus = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only SUPERADMIN can update event status.",
      });
    }

    const { eventId } = req.params;
    const { action, reason, notes } = req.body;

    const allowedActions = ["PUBLISH", "CANCEL", "COMPLETE"];
    if (!allowedActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Use: PUBLISH, CANCEL, or COMPLETE",
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    const statusMap = {
      PUBLISH: "PUBLISHED",
      CANCEL: "CANCELLED",
      COMPLETE: "COMPLETED",
    };
    const newStatus = statusMap[action];

    if (event.status === newStatus) {
      return res.status(400).json({
        success: false,
        message: `Event is already marked as ${newStatus}.`,
      });
    }

    const previousStatus = event.status;
    event.status = newStatus;
    event.statusLog = [
      ...(event.statusLog || []),
      {
        action,
        reason: reason || null,
        notes: notes || null,
        changedBy: req.user._id,
        changedAt: new Date(),
      },
    ];

    await event.save();

    const toEmail = process.env.SUPERADMIN_EMAIL || process.env.EMAIL_USER;
    await sendEventStatusUpdatedEmail(
      toEmail,
      event,
      req.user.name || "Super Admin",
      previousStatus
    );

    res.status(200).json({
      success: true,
      message: `Event status updated to ${newStatus}`,
      event,
    });
  } catch (error) {
    console.error("❌ Error updating event status:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * Update booking status (SUPERADMIN only)
 * @route PATCH /api/super-admin/ticket/update-booking-status/:bookingId
 * @access SUPERADMIN
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only SUPERADMIN can update booking status.",
      });
    }

    const { bookingId } = req.params;
    const { bookingStatus, paymentStatus, reason, notes } = req.body;

    const allowedBookingStatuses = [
      "PENDING",
      "CONFIRMED",
      "CANCELLED",
      "REFUNDED",
    ];
    const allowedPaymentStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];

    if (bookingStatus && !allowedBookingStatuses.includes(bookingStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking status. Use: PENDING, CONFIRMED, CANCELLED, or REFUNDED",
      });
    }

    if (paymentStatus && !allowedPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment status. Use: PENDING, PAID, FAILED, or REFUNDED",
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const booking = await TicketBooking.findById(bookingId)
        .populate("user event")
        .session(session);
      if (!booking) {
        await session.abortTransaction();
        return res
          .status(404)
          .json({ success: false, message: "Booking not found" });
      }

      const previousBookingStatus = booking.bookingStatus;
      const previousPaymentStatus = booking.paymentStatus;

      if (bookingStatus) booking.bookingStatus = bookingStatus;
      if (paymentStatus) booking.paymentStatus = paymentStatus;

      booking.statusLog = [
        ...(booking.statusLog || []),
        {
          bookingStatus: {
            from: previousBookingStatus,
            to: bookingStatus || previousBookingStatus,
          },
          paymentStatus: {
            from: previousPaymentStatus,
            to: paymentStatus || previousPaymentStatus,
          },
          reason: reason || null,
          notes: notes || null,
          changedBy: req.user._id,
          changedAt: new Date(),
        },
      ];

      if (
        previousBookingStatus !== "CONFIRMED" &&
        bookingStatus === "CONFIRMED"
      ) {
        const event = await Event.findById(booking.event._id).session(session);
        const ticket = event.ticketConfig.ticketTypes.find(
          (t) => t.name === booking.ticketType
        );

        if (ticket) {
          ticket.sold = (ticket.sold || 0) + booking.quantity;
          await event.save({ session });
        }
      }

      await booking.save({ session });

      if (bookingStatus) {
        await User.updateOne(
          { "bookedEvents.bookingId": booking._id },
          { $set: { "bookedEvents.$.bookingStatus": bookingStatus } },
          { session }
        );
      }

      await session.commitTransaction();

      // Send email notification if status was changed
      if (bookingStatus || paymentStatus) {
        try {
          const updates = {
            bookingStatus: bookingStatus || previousBookingStatus,
            paymentStatus: paymentStatus || previousPaymentStatus,
            previousBookingStatus,
            previousPaymentStatus,
            reason: reason || null,
            notes: notes || null,
          };

          await sendBookingStatusUpdateEmail(
            booking.user.email,
            booking,
            booking.event,
            booking.user,
            updates,
            req.user.userName || "Administrator"
          );
        } catch (emailError) {
          console.error("Failed to send status update email:", emailError);
          // Don't fail the request if email fails
        }
      }

      res.status(200).json({
        success: true,
        message: "Booking status updated successfully",
        booking: {
          _id: booking._id,
          bookingStatus: booking.bookingStatus,
          paymentStatus: booking.paymentStatus,
          user: booking.user.userName,
          event: booking.event.title,
          statusLog: booking.statusLog,
        },
      });
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("❌ Error updating booking status:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
