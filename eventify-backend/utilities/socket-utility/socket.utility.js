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
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
    pingTimeout: 20000,
    pingInterval: 25000,
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
    if (socket.user?.id) {
      socket.join(socket.user.id);
    }

    socket.on("disconnect", (reason) => {
      console.log(`User ${socket.user?.id} disconnected. Reason: ${reason}`);
    });

    socket.on("error", (error) => {
      console.error(`Socket error for user ${socket.user?.id}:`, error);
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
