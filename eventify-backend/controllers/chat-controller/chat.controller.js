/**
 * @fileoverview Controller module for managing chat between users and organizers.
 *
 * This module provides real-time chat functionality via Socket.io,
 * including starting chats, sending messages, retrieving chat history,
 * fetching all chats (organizer perspective), and deleting chats.
 *
 * @module controllers/chatController
 */

const mongoose = require("mongoose");
const User = require("../../models/user-model/user.model");
const Organizer = require("../../models/organizer-model/organizer.model");
const Chat = require("../../models/chat-model/chat.model");

const CHAT_EVENTS = {
  // Events to EMIT (send)
  START_CHAT: "startChat",
  SEND_MESSAGE: "sendMessage",
  GET_CHAT_HISTORY: "getChatHistory",
  GET_ALL_CHATS: "getAllChats",
  DELETE_CHAT: "deleteChat",

  // Events to LISTEN (receive)
  NEW_CHAT: "newChat",
  NEW_MESSAGE: "newMessage",
  CHAT_HISTORY: "chatHistory",
  ALL_CHATS_LIST: "allChatsList",
  CHAT_DELETED: "chatDeleted",
};

const sendError = (socket, message, details = null) => {
  const errorResponse = {
    success: false,
    message,
    ...(details && { details }),
  };
  socket.emit("error", errorResponse);
  return errorResponse;
};

const sendSuccess = (socket, message, data = null) => {
  const successResponse = { success: true, message, ...(data && { data }) };
  socket.emit("success", successResponse);
  return successResponse;
};

/**
 * @description Initialize chat socket listeners
 * @param {import("socket.io").Server} io - Socket.io server instance
 */
exports.initializeChatSocket = (io) => {
  io.on("connection", (socket) => {
    socket.join(socket.user.id);

    /**
     * @description Start Chat
     */
    socket.on(CHAT_EVENTS.START_CHAT, async (data) => {
      try {
        console.log("START_CHAT received:", { data, socketUser: socket.user });

        const { userId, organizerId, initialMessage } = data;

        // Debug logging
        console.log("User verification:", {
          socketUserId: socket.user.id,
          requestedUserId: userId,
          socketUserRole: socket.user.role,
          idsMatch: socket.user.id === userId,
          isUser: socket.user.role === "USER",
        });

        // Enhanced authorization check
        if (socket.user.id !== userId) {
          console.log("Authorization failed: User ID mismatch");
          return sendError(
            socket,
            "You can only start chats for your own account"
          );
        }

        if (socket.user.role !== "USER") {
          console.log("Authorization failed: Role is not USER");
          return sendError(
            socket,
            "Only regular users can start chats with organizers"
          );
        }

        // Rest of the code remains the same...
        if (
          !mongoose.Types.ObjectId.isValid(userId) ||
          !mongoose.Types.ObjectId.isValid(organizerId)
        ) {
          return sendError(socket, "Invalid user or organizer ID provided");
        }

        const organizer = await Organizer.findById(organizerId);
        if (!organizer) {
          return sendError(socket, "Organizer not found");
        }

        let existingChat = await Chat.findOne({
          user: userId,
          organizer: organizerId,
          isActive: true,
        })
          .populate("user", "userName email profileImage")
          .populate("organizer", "organizerName email profileImage");

        if (existingChat) {
          return sendSuccess(socket, "Existing chat found", {
            chatId: existingChat._id,
            messages: existingChat.messages,
            participants: {
              user: existingChat.user,
              organizer: existingChat.organizer,
            },
          });
        }

        const newChat = new Chat({
          user: userId,
          organizer: organizerId,
          messages: [
            {
              sender: "USER",
              text:
                initialMessage ||
                "Hello! I'd like to inquire about your events.",
              sentAt: new Date(),
            },
          ],
          isActive: true,
        });

        await newChat.save();
        const populatedChat = await Chat.findById(newChat._id)
          .populate("user", "userName email profileImage")
          .populate("organizer", "organizerName email profileImage");

        sendSuccess(socket, "Chat started successfully", {
          chatId: populatedChat._id,
          messages: populatedChat.messages,
          participants: {
            user: populatedChat.user,
            organizer: populatedChat.organizer,
          },
        });

        // Notify organizer
        io.to(organizerId).emit(CHAT_EVENTS.NEW_CHAT, {
          chatId: populatedChat._id,
          user: populatedChat.user,
          initialMessage: populatedChat.messages[0],
          timestamp: new Date(),
        });

        console.log("Chat started successfully for user:", userId);
      } catch (error) {
        console.error("START_CHAT error:", error);
        sendError(socket, "Failed to start chat", error.message);
      }
    });

    /**
     * @description Send Message
     */
    socket.on(CHAT_EVENTS.SEND_MESSAGE, async (data) => {
      try {
        const { chatId, text } = data;
        const senderType =
          socket.user.role === "ORGANIZER" ? "ORGANIZER" : "USER";

        if (!mongoose.Types.ObjectId.isValid(chatId))
          return sendError(socket, "Invalid chat ID");

        const chat = await Chat.findById(chatId);
        if (!chat) return sendError(socket, "Chat not found");

        if (
          (senderType === "USER" && socket.user.id !== chat.user.toString()) ||
          (senderType === "ORGANIZER" &&
            socket.user.id !== chat.organizer.toString())
        ) {
          return sendError(socket, "Unauthorized to send message in this chat");
        }

        const newMessage = { sender: senderType, text, sentAt: new Date() };
        chat.messages.push(newMessage);
        chat.isActive = true;
        await chat.save();

        sendSuccess(socket, "Message sent successfully", {
          chatId: chat._id,
          message: newMessage,
        });

        const recipientId =
          senderType === "USER"
            ? chat.organizer.toString()
            : chat.user.toString();
        io.to(recipientId).emit(CHAT_EVENTS.NEW_MESSAGE, {
          chatId: chat._id,
          message: newMessage,
        });
      } catch (error) {
        console.error("SEND_MESSAGE error:", error);
        sendError(socket, "Failed to send message", error.message);
      }
    });

    /**
     * @description Get Chat History
     */
    socket.on(CHAT_EVENTS.GET_CHAT_HISTORY, async (data) => {
      try {
        const { chatId } = data;
        if (!mongoose.Types.ObjectId.isValid(chatId))
          return sendError(socket, "Invalid chat ID");

        const chat = await Chat.findById(chatId)
          .populate("user")
          .populate("organizer");
        if (!chat) return sendError(socket, "Chat not found");

        socket.emit(CHAT_EVENTS.CHAT_HISTORY, {
          chatId: chat._id,
          user: chat.user,
          organizer: chat.organizer,
          messages: chat.messages,
          isActive: chat.isActive,
        });
      } catch (error) {
        console.error("GET_CHAT_HISTORY error:", error);
        sendError(socket, "Failed to get chat history", error.message);
      }
    });

    /**
     * @description Get all Chats
     */
    socket.on(CHAT_EVENTS.GET_ALL_CHATS, async () => {
      try {
        if (socket.user.role !== "ORGANIZER")
          return sendError(socket, "Only organizers can view all chats");

        const chats = await Chat.find({ organizer: socket.user.id })
          .sort({ updatedAt: -1 })
          .populate("user")
          .populate("organizer");

        socket.emit(CHAT_EVENTS.ALL_CHATS_LIST, chats);
      } catch (error) {
        console.error("GET_ALL_CHATS error:", error);
        sendError(socket, "Failed to fetch all chats", error.message);
      }
    });

    /**
     * @description Delete Chat
     */
    socket.on(CHAT_EVENTS.DELETE_CHAT, async (data) => {
      try {
        const { chatId } = data;
        if (!mongoose.Types.ObjectId.isValid(chatId))
          return sendError(socket, "Invalid chat ID");

        const chat = await Chat.findById(chatId);
        if (!chat) return sendError(socket, "Chat not found");

        if (socket.user.role !== "ORGANIZER")
          return sendError(socket, "Unauthorized to delete chat");

        const participants = {
          userId: chat.user.toString(),
          organizerId: chat.organizer.toString(),
        };
        await Chat.findByIdAndDelete(chatId);

        sendSuccess(socket, "Chat deleted successfully", {
          chatId: chat._id,
          deletedAt: new Date(),
        });

        io.to(participants.userId).emit(CHAT_EVENTS.CHAT_DELETED, {
          chatId: chat._id,
        });
        io.to(participants.organizerId).emit(CHAT_EVENTS.CHAT_DELETED, {
          chatId: chat._id,
        });
      } catch (error) {
        console.error("DELETE_CHAT error:", error);
        sendError(socket, "Failed to delete chat", error.message);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.user?.id} disconnected`);
    });
  });
};
