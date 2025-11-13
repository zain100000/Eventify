const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

/**
 * @function initializeSocket
 * @description Initializes Socket.IO server with JWT authentication
 * @param {Object} server - HTTP server instance
 * @returns {Object} Socket.IO instance
 */
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000, // Increased for serverless
    pingInterval: 25000,
    path: "/socket.io/", // Explicit path for Vercel
    // Vercel-specific configurations
    allowEIO3: true,
  });

  // Handle WebSocket upgrades for Vercel
  io.engine.on("initial_headers", (headers, req) => {
    headers["Access-Control-Allow-Origin"] = process.env.ALLOWED_ORIGINS || "*";
    headers["Access-Control-Allow-Credentials"] = "true";
  });

  io.engine.on("headers", (headers, req) => {
    headers["Access-Control-Allow-Origin"] = process.env.ALLOWED_ORIGINS || "*";
    headers["Access-Control-Allow-Credentials"] = "true";
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded?.user?.id || !decoded?.role) {
        return next(new Error("Authentication error: Invalid token structure"));
      }

      socket.user = {
        id: decoded.user.id,
        role: decoded.role,
        email: decoded.user.email,
      };

      next();
    } catch (error) {
      next(new Error("Authentication failed: " + error.message));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.user?.id} connected with socket ${socket.id}`);

    if (socket.user?.id) {
      socket.join(socket.user.id);
      socket.join(socket.user.role); // Join role-based room
    }

    socket.on("disconnect", (reason) => {
      console.log(`User ${socket.user?.id} disconnected. Reason: ${reason}`);
    });

    socket.on("error", (error) => {
      console.error(`Socket error for user ${socket.user?.id}:`, error);
    });

    // Health check for socket connection
    socket.on("ping", (cb) => {
      if (typeof cb === "function") {
        cb({ status: "ok", timestamp: new Date().toISOString() });
      }
    });
  });

  return io;
};

/**
 * @function getIo
 * @description Returns the initialized Socket.IO instance
 * @returns {Object} Socket.IO instance
 * @throws {Error} If Socket.IO is not initialized
 */
const getIo = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { initializeSocket, getIo };
