const mongoose = require("mongoose");

/**
 * @schema UserSchema
 * @description Schema representing users who can book tickets for events.
 */
const userSchema = new mongoose.Schema(
  {
    profilePicture: {
      type: String,
    },

    userName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    address: {
      type: String,
    },

    phone: {
      type: String,
    },

    /**
     * ✅ Events the user has booked tickets for
     */
    bookedEvents: [
      {
        bookingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TicketBooking",
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        eventId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Event",
        },
        ticketType: String,
        quantity: Number,
        totalPrice: Number,
        bookingStatus: {
          type: String,
          enum: ["PENDING", "CONFIRMED", "CANCELLED", "REFUNDED"],
          default: "PENDING",
        },
        bookedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    /**
     * ✅ Events created by this user (for when users can host)
     */
    organizedEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],

    role: {
      type: String,
      enum: ["USER"],
      default: "USER",
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    sessionId: {
      type: String,
      default: null,
    },

    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
