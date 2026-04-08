const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get messages for a match
router.get("/match/:matchId", authenticateToken, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user has access to this match
    const match = await db("matches")
      .join("jobs", "matches.job_id", "jobs.id")
      .join("professionals", "matches.professional_id", "professionals.id")
      .where("matches.id", matchId)
      .where(function () {
        this.where("jobs.customer_id", req.user.id).orWhere(
          "professionals.user_id",
          req.user.id
        );
      })
      .first();

    if (!match) {
      return res
        .status(404)
        .json({ error: "Match not found or access denied" });
    }

    const offset = (page - 1) * limit;
    const messages = await db("messages")
      .join("users", "messages.sender_id", "users.id")
      .where("messages.match_id", matchId)
      .select(
        "messages.*",
        "users.first_name",
        "users.last_name",
        "users.profile_image_url"
      )
      .orderBy("messages.created_at", "desc")
      .limit(limit)
      .offset(offset);

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Send a message
router.post("/send", authenticateToken, async (req, res) => {
  try {
    const { matchId, content, messageType = "text", attachmentUrl } = req.body;

    // Verify user has access to this match
    const match = await db("matches")
      .join("jobs", "matches.job_id", "jobs.id")
      .join("professionals", "matches.professional_id", "professionals.id")
      .where("matches.id", matchId)
      .where(function () {
        this.where("jobs.customer_id", req.user.id).orWhere(
          "professionals.user_id",
          req.user.id
        );
      })
      .first();

    if (!match) {
      return res
        .status(404)
        .json({ error: "Match not found or access denied" });
    }

    // Create message
    const [message] = await db("messages")
      .insert({
        match_id: matchId,
        sender_id: req.user.id,
        content,
        message_type: messageType,
        attachment_url: attachmentUrl,
      })
      .returning("*");

    // Get sender info
    const sender = await db("users")
      .where("id", req.user.id)
      .select("first_name", "last_name", "profile_image_url")
      .first();

    res.status(201).json({
      message: {
        ...message,
        first_name: sender.first_name,
        last_name: sender.last_name,
        profile_image_url: sender.profile_image_url,
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Mark messages as read
router.put("/mark-read", authenticateToken, async (req, res) => {
  try {
    const { matchId } = req.body;

    // Mark all messages in this match as read for the current user
    await db("messages")
      .where("match_id", matchId)
      .where("sender_id", "!=", req.user.id)
      .update({ is_read: true });

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark messages as read error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
