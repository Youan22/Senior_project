const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await db("users")
      .where("id", req.user.id)
      .select(
        "id",
        "email",
        "first_name",
        "last_name",
        "phone",
        "user_type",
        "is_verified",
        "created_at"
      )
      .first();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const [updatedUser] = await db("users")
      .where("id", req.user.id)
      .update({
        first_name: firstName,
        last_name: lastName,
        phone,
        updated_at: new Date(),
      })
      .returning([
        "id",
        "email",
        "first_name",
        "last_name",
        "phone",
        "user_type",
      ]);

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
