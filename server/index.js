const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { createServer } = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "../.env" });

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const professionalRoutes = require("./routes/professionals");
const matchRoutes = require("./routes/matches");
const jobRoutes = require("./routes/jobs");
const paymentRoutes = require("./routes/payments");
const messageRoutes = require("./routes/messages");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/professionals", professionalRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/messages", messageRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userType = decoded.userType;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id, "User ID:", socket.userId);

  // Join a match room for messaging
  socket.on("join_match", (matchId) => {
    socket.join(`match_${matchId}`);
    console.log(`User ${socket.id} joined match room ${matchId}`);
  });

  // Leave a match room
  socket.on("leave_match", (matchId) => {
    socket.leave(`match_${matchId}`);
    console.log(`User ${socket.id} left match room ${matchId}`);
  });

  // Handle real-time message sending
  socket.on("send_message", async (data) => {
    try {
      const { matchId, content, messageType = "text", attachmentUrl } = data;

      // Emit to all users in the match room
      io.to(`match_${matchId}`).emit("new_message", {
        matchId,
        content,
        messageType,
        attachmentUrl,
        senderId: socket.userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Socket message error:", error);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  // Handle typing indicators
  socket.on("typing_start", (data) => {
    socket.to(`match_${data.matchId}`).emit("user_typing", {
      userId: socket.userId,
      matchId: data.matchId,
    });
  });

  socket.on("typing_stop", (data) => {
    socket.to(`match_${data.matchId}`).emit("user_stopped_typing", {
      userId: socket.userId,
      matchId: data.matchId,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 ServiceMatch server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
});
