const express = require("express");
const db = require("../db");
const {
  orderMatchesByNewest,
  transformCustomerMatchRow,
  transformProfessionalMatchRow,
} = require("../lib/matchesList");
const {
  authenticateToken,
  requireCustomer,
  requireProfessional,
} = require("../middleware/auth");

const router = express.Router();

// Get matches for a job (customer view)
router.get(
  "/job/:jobId",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const { jobId } = req.params;

      // Verify job belongs to customer
      const job = await db("jobs")
        .where({ id: jobId, customer_id: req.user.id })
        .first();

      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      // Get matches with professional details
      const matches = await db("matches")
        .join("professionals", "matches.professional_id", "professionals.id")
        .join("users", "professionals.user_id", "users.id")
        .join(
          "professional_videos",
          "professionals.id",
          "professional_videos.professional_id"
        )
        .where("matches.job_id", jobId)
        .where("professional_videos.is_primary", true)
        .select(
          "matches.*",
          "professionals.business_name",
          "professionals.description",
          "professionals.rating",
          "professionals.total_reviews",
          "professionals.years_experience",
          "professionals.service_category",
          "users.first_name",
          "users.last_name",
          "users.profile_image_url",
          "professional_videos.video_url",
          "professional_videos.thumbnail_url"
        );

      res.json({ matches });
    } catch (error) {
      console.error("Get matches error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Swipe on a match (customer)
router.post(
  "/:matchId/swipe",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const { matchId } = req.params;
      const { action } = req.body; // 'like' or 'pass'

      // Verify match exists and belongs to customer
      const match = await db("matches")
        .join("jobs", "matches.job_id", "jobs.id")
        .where("matches.id", matchId)
        .where("jobs.customer_id", req.user.id)
        .first();

      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      // Update match status
      const updateData = {
        customer_swiped: true,
        updated_at: new Date(),
      };

      if (action === "like") {
        // Mutual acceptance required: customer + professional.
        updateData.status = match.professional_swiped ? "accepted" : "pending";
      } else {
        updateData.status = "declined";
      }

      await db("matches").where("id", matchId).update(updateData);

      res.json({ message: "Swipe recorded successfully" });
    } catch (error) {
      console.error("Swipe error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get matches for a customer
router.get(
  "/customer",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const matches = await orderMatchesByNewest(
        db("matches")
          .join("jobs", "matches.job_id", "jobs.id")
          .join("professionals", "matches.professional_id", "professionals.id")
          .join("users", "professionals.user_id", "users.id")
          .where("jobs.customer_id", req.user.id)
          .select(
            "matches.*",
            "jobs.title",
            "jobs.description",
            "jobs.service_category",
            "jobs.budget_min",
            "jobs.budget_max",
            "jobs.urgency",
            "jobs.address",
            "jobs.city",
            "jobs.state",
            "jobs.zip_code",
            "jobs.preferred_date",
            "jobs.created_at as job_created_at",
            "users.first_name",
            "users.last_name",
            "users.profile_image_url",
            "professionals.business_name",
            "professionals.rating",
            "professionals.total_reviews"
          )
      );

      const transformedMatches = matches.map(transformCustomerMatchRow);

      res.json({ matches: transformedMatches });
    } catch (error) {
      console.error("Get customer matches error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get matches for professional (alias for /professional)
router.get(
  "/my-matches",
  authenticateToken,
  requireProfessional,
  async (req, res) => {
    try {
      // Get professional ID
      const professional = await db("professionals")
        .where("user_id", req.user.id)
        .first();

      if (!professional) {
        return res
          .status(404)
          .json({ error: "Professional profile not found" });
      }

      const matches = await orderMatchesByNewest(
        db("matches")
          .join("jobs", "matches.job_id", "jobs.id")
          .join("users", "jobs.customer_id", "users.id")
          .where("matches.professional_id", professional.id)
          .select(
            "matches.*",
            "jobs.title",
            "jobs.description",
            "jobs.service_category",
            "jobs.address",
            "jobs.city",
            "jobs.state",
            "jobs.zip_code",
            "jobs.budget_min",
            "jobs.budget_max",
            "jobs.urgency",
            "jobs.preferred_date",
            "jobs.created_at as job_created_at",
            "users.first_name",
            "users.last_name",
            "users.profile_image_url"
          )
      );

      const transformedMatches = matches.map(transformProfessionalMatchRow);

      res.json({ matches: transformedMatches });
    } catch (error) {
      console.error("Get professional matches error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get matches for professional
router.get(
  "/professional",
  authenticateToken,
  requireProfessional,
  async (req, res) => {
    try {
      // Get professional ID
      const professional = await db("professionals")
        .where("user_id", req.user.id)
        .first();

      if (!professional) {
        return res
          .status(404)
          .json({ error: "Professional profile not found" });
      }

      const matches = await orderMatchesByNewest(
        db("matches")
          .join("jobs", "matches.job_id", "jobs.id")
          .join("users", "jobs.customer_id", "users.id")
          .where("matches.professional_id", professional.id)
          .select(
            "matches.*",
            "jobs.title",
            "jobs.description",
            "jobs.service_category",
            "jobs.address",
            "jobs.city",
            "jobs.state",
            "jobs.zip_code",
            "jobs.budget_min",
            "jobs.budget_max",
            "jobs.urgency",
            "jobs.preferred_date",
            "jobs.created_at as job_created_at",
            "users.first_name",
            "users.last_name",
            "users.profile_image_url"
          )
      );

      const transformedMatches = matches.map(transformProfessionalMatchRow);

      res.json({ matches: transformedMatches });
    } catch (error) {
      console.error("Get professional matches error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Accept a match (professional)
router.post(
  "/:matchId/accept",
  authenticateToken,
  requireProfessional,
  async (req, res) => {
    try {
      const { matchId } = req.params;

      // Get professional ID
      const professional = await db("professionals")
        .where("user_id", req.user.id)
        .first();

      if (!professional) {
        return res
          .status(404)
          .json({ error: "Professional profile not found" });
      }

      // Verify match belongs to professional
      const match = await db("matches")
        .where("id", matchId)
        .where("professional_id", professional.id)
        .first();

      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      // Update match status
      await db("matches").where("id", matchId).update({
        // Mutual acceptance required: professional + customer.
        status: match.customer_swiped ? "accepted" : "pending",
        professional_swiped: true,
        updated_at: new Date(),
      });

      res.json({ message: "Match accepted successfully" });
    } catch (error) {
      console.error("Accept match error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Decline a match (professional)
router.post(
  "/:matchId/decline",
  authenticateToken,
  requireProfessional,
  async (req, res) => {
    try {
      const { matchId } = req.params;

      // Get professional ID
      const professional = await db("professionals")
        .where("user_id", req.user.id)
        .first();

      if (!professional) {
        return res
          .status(404)
          .json({ error: "Professional profile not found" });
      }

      // Verify match belongs to professional
      const match = await db("matches")
        .where("id", matchId)
        .where("professional_id", professional.id)
        .first();

      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      // Update match status
      await db("matches").where("id", matchId).update({
        status: "declined",
        professional_swiped: true,
        updated_at: new Date(),
      });

      res.json({ message: "Match declined successfully" });
    } catch (error) {
      console.error("Decline match error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Swipe on a match (professional)
router.post(
  "/:matchId/professional-swipe",
  authenticateToken,
  requireProfessional,
  async (req, res) => {
    try {
      const { matchId } = req.params;
      const { action } = req.body; // 'like' or 'pass'

      // Get professional ID
      const professional = await db("professionals")
        .where("user_id", req.user.id)
        .first();

      if (!professional) {
        return res
          .status(404)
          .json({ error: "Professional profile not found" });
      }

      // Verify match belongs to professional
      const match = await db("matches")
        .where("id", matchId)
        .where("professional_id", professional.id)
        .first();

      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      // Update match status
      const updateData = {
        professional_swiped: true,
        updated_at: new Date(),
      };

      if (action === "like") {
        // Mutual acceptance required: professional + customer.
        updateData.status = match.customer_swiped ? "accepted" : "pending";
      } else {
        updateData.status = "declined";
      }

      await db("matches").where("id", matchId).update(updateData);

      res.json({ message: "Swipe recorded successfully" });
    } catch (error) {
      console.error("Professional swipe error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Professional marks job as done; customer confirmation completes it.
router.post(
  "/:matchId/mark-done",
  authenticateToken,
  requireProfessional,
  async (req, res) => {
    try {
      const { matchId } = req.params;

      const professional = await db("professionals")
        .where("user_id", req.user.id)
        .first();
      if (!professional) {
        return res
          .status(404)
          .json({ error: "Professional profile not found" });
      }

      const match = await db("matches")
        .where("id", matchId)
        .where("professional_id", professional.id)
        .first();
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      if (match.status !== "accepted") {
        return res.status(400).json({
          error: "Match must be mutually accepted before marking as done",
        });
      }

      const now = new Date();
      await db("matches").where("id", matchId).update({
        professional_completed_at: now,
        updated_at: now,
      });

      // Final completion occurs after both sides confirm.
      if (match.customer_completed_at) {
        await db("jobs").where("id", match.job_id).update({
          status: "completed",
          updated_at: now,
        });
      }

      res.json({
        message: "Marked as done. Waiting for customer confirmation.",
      });
    } catch (error) {
      console.error("Mark done error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Customer confirms completion after professional marks done.
router.post(
  "/:matchId/confirm-complete",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const { matchId } = req.params;

      const match = await db("matches")
        .join("jobs", "matches.job_id", "jobs.id")
        .where("matches.id", matchId)
        .where("jobs.customer_id", req.user.id)
        .select("matches.*", "jobs.id as job_id")
        .first();
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      if (match.status !== "accepted") {
        return res.status(400).json({
          error: "Match must be accepted before completion confirmation",
        });
      }
      if (!match.professional_completed_at) {
        return res.status(400).json({
          error: "Professional must mark the job as done first",
        });
      }

      const now = new Date();
      await db("matches").where("id", matchId).update({
        customer_completed_at: now,
        updated_at: now,
      });

      await db("jobs").where("id", match.job_id).update({
        status: "completed",
        updated_at: now,
      });

      res.json({ message: "Job completed successfully" });
    } catch (error) {
      console.error("Confirm complete error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
