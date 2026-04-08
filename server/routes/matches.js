const express = require("express");
const db = require("../db");
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
      const updateData = { customer_swiped: true };

      if (action === "like") {
        updateData.status = "accepted";
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
      const matches = await db("matches")
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
        );

      // Transform the data to include proper structure
      const transformedMatches = matches.map((match) => ({
        id: match.id,
        job_id: match.job_id,
        professional_id: match.professional_id,
        status: match.status,
        created_at: match.created_at,
        job: {
          id: match.job_id,
          title: match.title,
          description: match.description,
          service_category: match.service_category,
          budget_min: match.budget_min,
          budget_max: match.budget_max,
          urgency: match.urgency,
          address: match.address,
          city: match.city,
          state: match.state,
          zip_code: match.zip_code,
          preferred_date: match.preferred_date,
          created_at: match.job_created_at,
        },
        professional: {
          id: match.professional_id,
          business_name: match.business_name,
          rating: match.rating ? parseFloat(match.rating) : 0,
          total_reviews: match.total_reviews
            ? parseInt(match.total_reviews)
            : 0,
          firstName: match.first_name,
          lastName: match.last_name,
          profile_image_url: match.profile_image_url,
        },
      }));

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

      // Get matches with job details
      const matches = await db("matches")
        .join("jobs", "matches.job_id", "jobs.id")
        .join("users", "jobs.customer_id", "users.id")
        .where("matches.professional_id", professional.id)
        .select(
          "matches.*",
          "jobs.title",
          "jobs.description",
          "jobs.address",
          "jobs.city",
          "jobs.state",
          "jobs.budget_min",
          "jobs.budget_max",
          "jobs.urgency",
          "jobs.preferred_date",
          "jobs.created_at as job_created_at",
          "users.first_name",
          "users.last_name",
          "users.profile_image_url"
        );

      // Transform the data to include proper job structure
      const transformedMatches = matches.map((match) => ({
        id: match.id,
        job_id: match.job_id,
        professional_id: match.professional_id,
        status: match.status,
        created_at: match.created_at,
        job: {
          id: match.job_id,
          title: match.title,
          description: match.description,
          service_category: match.service_category,
          budget_min: match.budget_min,
          budget_max: match.budget_max,
          urgency: match.urgency,
          address: match.address,
          city: match.city,
          state: match.state,
          zip_code: match.zip_code,
          preferred_date: match.preferred_date,
          created_at: match.job_created_at,
          customer: {
            firstName: match.first_name,
            lastName: match.last_name,
            profile_image_url: match.profile_image_url,
          },
        },
      }));

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

      // Get matches with job details
      const matches = await db("matches")
        .join("jobs", "matches.job_id", "jobs.id")
        .join("users", "jobs.customer_id", "users.id")
        .where("matches.professional_id", professional.id)
        .select(
          "matches.*",
          "jobs.title",
          "jobs.description",
          "jobs.address",
          "jobs.city",
          "jobs.state",
          "jobs.budget_min",
          "jobs.budget_max",
          "jobs.urgency",
          "jobs.preferred_date",
          "users.first_name",
          "users.last_name",
          "users.profile_image_url"
        );

      // Transform the data to include proper job structure
      const transformedMatches = matches.map((match) => ({
        id: match.id,
        job_id: match.job_id,
        professional_id: match.professional_id,
        status: match.status,
        created_at: match.created_at,
        job: {
          id: match.job_id,
          title: match.title,
          description: match.description,
          service_category: match.service_category,
          budget_min: match.budget_min,
          budget_max: match.budget_max,
          urgency: match.urgency,
          address: match.address,
          city: match.city,
          state: match.state,
          zip_code: match.zip_code,
          preferred_date: match.preferred_date,
          created_at: match.job_created_at,
          customer: {
            firstName: match.first_name,
            lastName: match.last_name,
            profile_image_url: match.profile_image_url,
          },
        },
      }));

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
        status: "accepted",
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
      const updateData = { professional_swiped: true };

      if (action === "like") {
        updateData.status = "accepted";
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

module.exports = router;
