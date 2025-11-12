/**
 * @fileoverview Event controller - createEvent
 * @module controllers/eventController
 */

const Event = require("../../models/event-model/event.model");
const User = require("../../models/user-model/user.model");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../../utilities/cloudinary-utility/cloudinary.utility");
const {
  sendEventCreatedEmail,
} = require("../../helpers/email-helper/email.helper");

/**
 * @description Controller for creating a new event with organizer booking
 * @route POST /api/event/create-event
 * @access SUPERADMIN / USER
 */
exports.createEvent = async (req, res) => {
  let uploadedFileUrls = [];

  try {
    if (
      !req.user ||
      (req.user.role !== "SUPERADMIN" && req.user.role !== "USER")
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const {
      title,
      description,
      category,
      type,
      venue,
      dateTime,
      ticketConfig,
      status,
      isFeatured,
      primaryIndex,
      captions,
      organizerId, // <-- NEW: user selects an organizer
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !type ||
      !venue ||
      !dateTime ||
      !organizerId
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const Organizer = require("../../models/organizer-model/organizer.model");
    const organizer = await Organizer.findById(organizerId);
    if (!organizer) {
      return res
        .status(404)
        .json({ success: false, message: "Organizer not found" });
    }

    const parsedVenue = typeof venue === "string" ? JSON.parse(venue) : venue;
    const parsedDateTime =
      typeof dateTime === "string" ? JSON.parse(dateTime) : dateTime;
    const parsedTicketConfig =
      typeof ticketConfig === "string"
        ? JSON.parse(ticketConfig)
        : ticketConfig;

    const startDate = new Date(parsedDateTime.start?.trim());
    const endDate = new Date(parsedDateTime.end?.trim());
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid date format" });
    }

    const cleanedCategory = category.trim().toUpperCase();
    const cleanedType = type.trim().toUpperCase();
    const cleanedStatus = (status || "DRAFT").trim().toUpperCase();
    const parsedIsFeatured = isFeatured === "true" || isFeatured === true;
    const parsedIsRegistrationRequired =
      parsedTicketConfig?.isRegistrationRequired === "true" ||
      parsedTicketConfig?.isRegistrationRequired === true;

    // Upload event images
    let eventImage = [];
    if (req.files?.eventImage) {
      const filesToUpload = req.files.eventImage.slice(0, 5);
      const captionArray = captions ? captions.split(",") : [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const caption = captionArray[i]?.trim() || "";
        const uploadResult = await uploadToCloudinary(
          file,
          "eventImage",
          title
        );
        uploadedFileUrls.push(uploadResult.url);

        eventImage.push({
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          caption,
          isPrimary: Number(primaryIndex) === i,
        });
      }
    }

    const newEvent = new Event({
      title: title.trim(),
      description: description.trim(),
      category: cleanedCategory,
      type: cleanedType,
      venue: {
        name: parsedVenue.name?.trim(),
        address: parsedVenue.address?.trim(),
        city: parsedVenue.city?.trim(),
      },
      dateTime: { start: startDate, end: endDate },
      ticketConfig: {
        ...parsedTicketConfig,
        isRegistrationRequired: parsedIsRegistrationRequired,
      },
      status: cleanedStatus,
      isFeatured: parsedIsFeatured,
      eventImage,
      organizer: organizer._id, // <-- assign selected organizer
      createdBy: req.user._id,
    });

    await newEvent.save();

    // Update organizer's bookedEvents array
    organizer.bookedEvents.push({
      eventId: newEvent._id,
      userId: req.user._id,
      status: "PENDING",
    });
    await organizer.save();

    // Optional: send email notifications to all users
    const registeredUsers = await User.find({ email: { $exists: true } });
    for (const user of registeredUsers) {
      try {
        await sendEventCreatedEmail(user.email, newEvent, user.userName);
      } catch (emailError) {
        console.error(
          `Failed to send event email to ${user.email}:`,
          emailError
        );
      }
    }

    res.status(201).json({
      success: true,
      message: "Event created successfully!",
      event: newEvent,
    });
  } catch (error) {
    if (uploadedFileUrls.length > 0) {
      for (const url of uploadedFileUrls) {
        try {
          await deleteFromCloudinary(url);
        } catch (cloudErr) {
          console.error("Failed to delete Cloudinary image:", cloudErr);
        }
      }
    }

    console.error("❌ Error creating event:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * @description Controller to get all events
 * @route GET /api/event/get-all-events
 * @access Public
 */
exports.getAllEvents = async (req, res) => {
  try {
    const { status, category, type, isFeatured } = req.query;

    const filter = {};
    if (status) filter.status = status.trim().toUpperCase();
    if (category) filter.category = category.trim().toUpperCase();
    if (type) filter.type = type.trim().toUpperCase();
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";

    const events = await Event.find(filter)
      .populate({
        path: "organizer",
        populate: [
          {
            path: "organizerProfile",
            model: "OrganizerProfile",
          },
          {
            path: "bookedEvents.eventId",
            model: "Event",
            populate: [
              {
                path: "organizer",
                populate: {
                  path: "organizerProfile",
                  model: "OrganizerProfile",
                },
              },
              {
                path: "venue",
              },
              {
                path: "ticketConfig.ticketTypes",
              },
              {
                path: "eventImage",
              },
            ],
          },
        ],
      })
      .sort({ "dateTime.start": 1 });

    res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      count: events.length,
      allEvents: events,
    });
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @description Controller to update an existing event
 * @route PATCH /api/event/update-event/:eventId
 * @access SUPERADMIN
 */

exports.updateEvent = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only SUPERADMIN can update events.",
      });
    }

    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found!",
      });
    }

    let updates = {};

    // Basic fields
    if (req.body.title !== undefined) updates.title = req.body.title.trim();
    if (req.body.description !== undefined)
      updates.description = req.body.description.trim();
    if (req.body.category !== undefined) updates.category = req.body.category;
    if (req.body.type !== undefined) updates.type = req.body.type;
    if (req.body.organizerId !== undefined)
      updates.organizerId = req.body.organizerId;

    // Venue
    if (req.body.venue) {
      const parsedVenue =
        typeof req.body.venue === "string"
          ? JSON.parse(req.body.venue)
          : req.body.venue;
      updates.venue = { ...event.venue.toObject(), ...parsedVenue };
    }

    // DateTime
    if (req.body.dateTime) {
      const parsedDateTime =
        typeof req.body.dateTime === "string"
          ? JSON.parse(req.body.dateTime)
          : req.body.dateTime;

      const start = parsedDateTime.start
        ? new Date(parsedDateTime.start)
        : event.dateTime.start;
      const end = parsedDateTime.end
        ? new Date(parsedDateTime.end)
        : event.dateTime.end;

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format for start or end. Use ISO format.",
        });
      }

      if (start >= end) {
        return res.status(400).json({
          success: false,
          message: "Start date must be before end date",
        });
      }

      updates.dateTime = { start, end };
    }

    // Ticket config
    if (req.body.ticketConfig) {
      const parsedTicketConfig =
        typeof req.body.ticketConfig === "string"
          ? JSON.parse(req.body.ticketConfig)
          : req.body.ticketConfig;

      // Ensure ticket types have numeric values
      if (parsedTicketConfig.ticketTypes?.length) {
        parsedTicketConfig.ticketTypes = parsedTicketConfig.ticketTypes.map(
          (t) => ({
            ...t,
            price: Number(t.price),
            quantity: Number(t.quantity),
            sold: t.sold ? Number(t.sold) : 0,
          })
        );
      }

      updates.ticketConfig = parsedTicketConfig;
    }

    // Featured, captions, primaryIndex
    if (req.body.isFeatured !== undefined)
      updates.isFeatured = req.body.isFeatured;
    if (req.body.captions !== undefined) updates.captions = req.body.captions;
    if (req.body.primaryIndex !== undefined)
      updates.primaryIndex = Number(req.body.primaryIndex);

    // Event images
    if (req.files?.eventImage) {
      const filesToUpload = req.files.eventImage.slice(0, 5);
      const captions = req.body.captions ? req.body.captions.split(",") : [];
      const primaryIndex = Number(req.body.primaryIndex) || 0;

      let updatedImages = [...event.eventImage];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const caption = captions[i]?.trim() || "";

        const uploadResult = await uploadToCloudinary(
          file,
          "eventImage",
          event.title
        );

        if (updatedImages[i]) {
          await deleteFromCloudinary(updatedImages[i].publicId);
          updatedImages[i] = {
            url: uploadResult.url,
            publicId: uploadResult.publicId,
            caption,
            isPrimary: i === primaryIndex,
          };
        } else {
          updatedImages.push({
            url: uploadResult.url,
            publicId: uploadResult.publicId,
            caption,
            isPrimary: i === primaryIndex,
          });
        }
      }

      updates.eventImage = updatedImages;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(eventId, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("❌ Error updating event:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @description Controller to delete an existing event
 * @route DELETE /api/event/delete-event/:eventId
 * @access SUPERADMIN
 */
exports.deleteEvent = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only SUPERADMIN can delete events.",
      });
    }

    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found!",
      });
    }

    if (event.eventImage && event.eventImage.length > 0) {
      for (const img of event.eventImage) {
        try {
          await deleteFromCloudinary(img.publicId);
          console.log(`Deleted image from Cloudinary: ${img.publicId}`);
        } catch (cloudErr) {
          console.error(
            `Failed to delete Cloudinary image ${img.publicId}:`,
            cloudErr
          );
        }
      }
    }

    await Event.findByIdAndDelete(eventId);

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting event:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
