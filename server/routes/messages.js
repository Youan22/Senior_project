const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/auth");
const { getMatchAccess } = require("../lib/matchMembership");

const router = express.Router();

// Get unread message summary for current user
router.get("/unread-summary", authenticateToken, async (req, res) => {
  try {
    const rows = await db("messages")
      .join("matches", "messages.match_id", "matches.id")
      .join("jobs", "matches.job_id", "jobs.id")
      .join("professionals", "matches.professional_id", "professionals.id")
      .where("messages.is_read", false)
      .whereNot("messages.sender_id", req.user.id)
      .andWhere(function () {
        this.where("jobs.customer_id", req.user.id).orWhere(
          "professionals.user_id",
          req.user.id
        );
      })
      .groupBy("messages.match_id")
      .select("messages.match_id")
      .count("* as unread_count");

    const byMatch = {};
    let totalUnread = 0;

    for (const row of rows) {
      const count = parseInt(row.unread_count, 10) || 0;
      byMatch[row.match_id] = count;
      totalUnread += count;
    }

    res.json({ totalUnread, byMatch });
  } catch (error) {
    console.error("Get unread summary error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

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
    if (access.match.status !== "accepted") {
      return res.status(403).json({
        error: "Messaging is available after both customer and professional accept the match",
      });
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
    if (access.match.status !== "accepted") {
      return res.status(403).json({
        error: "Messaging is available after both customer and professional accept the match",
      });
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
    if (access.match.status !== "accepted") {
      return res.status(403).json({
        error: "Messaging is available after both customer and professional accept the match",
      });
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
