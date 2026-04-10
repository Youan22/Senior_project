const { createServer } = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const { createApp } = require("./app");
const { getAllowedOrigins } = require("./lib/corsConfig");

const app = createApp();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: getAllowedOrigins(),
    methods: ["GET", "POST"],
    credentials: true,
  },
});

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

io.on("connection", (socket) => {
  console.log("User connected:", socket.id, "User ID:", socket.userId);

  socket.on("join_match", (matchId) => {
    socket.join(`match_${matchId}`);
    console.log(`User ${socket.id} joined match room ${matchId}`);
  });

  socket.on("leave_match", (matchId) => {
    socket.leave(`match_${matchId}`);
    console.log(`User ${socket.id} left match room ${matchId}`);
  });

  socket.on("send_message", async (data) => {
    try {
      const { matchId, content, messageType = "text", attachmentUrl } = data;

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

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 ServiceMatch server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
});
