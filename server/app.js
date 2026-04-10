const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const professionalRoutes = require("./routes/professionals");
const matchRoutes = require("./routes/matches");
const jobRoutes = require("./routes/jobs");
const paymentRoutes = require("./routes/payments");
const messageRoutes = require("./routes/messages");
const { createExpressCorsOrigin } = require("./lib/corsConfig");

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(compression());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });
  app.use(limiter);

  app.use(
    cors({
      origin: createExpressCorsOrigin(),
      credentials: true,
    })
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/professionals", professionalRoutes);
  app.use("/api/matches", matchRoutes);
  app.use("/api/jobs", jobRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/messages", messageRoutes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

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

  app.use("*", (req, res) => {
    res.status(404).json({ error: "Route not found" });
  });

  return app;
}

module.exports = { createApp };
