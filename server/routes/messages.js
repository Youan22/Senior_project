const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/auth");
const { getMatchAccess } = require("../lib/matchMembership");

const router = express.Router();

// Get messages for a match
router.get("/match/:matchId", authenticateToken, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const access = await getMatchAccess(db, matchId, req.user.id);
    if (access.kind === "not_found") {
      return res.status(404).json({ error: "Match not found" });
    }
    if (access.kind === "forbidden") {
      return res.status(403).json({ error: "Access denied for this match" });
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

    const access = await getMatchAccess(db, matchId, req.user.id);
    if (access.kind === "not_found") {
      return res.status(404).json({ error: "Match not found" });
    }
    if (access.kind === "forbidden") {
      return res.status(403).json({ error: "Access denied for this match" });
    }

    const [message] = await db("messages")
      .insert({
        match_id: matchId,
        sender_id: req.user.id,
        content,
        message_type: messageType,
        attachment_url: attachmentUrl,
      })
      .returning("*");

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

// Mark messages as read (only messages from others in this match; caller must be a participant)
router.put("/mark-read", authenticateToken, async (req, res) => {
  try {
    const { matchId } = req.body;

    const access = await getMatchAccess(db, matchId, req.user.id);
    if (access.kind === "not_found") {
      return res.status(404).json({ error: "Match not found" });
    }
    if (access.kind === "forbidden") {
      return res.status(403).json({ error: "Access denied for this match" });
    }

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
