const express = require("express");
const Joi = require("joi");
const db = require("../db");
const { authenticateToken, requireCustomer } = require("../middleware/auth");
const matchingService = require("../services/matchingService");

const router = express.Router();

// Validation schema
const jobSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  serviceCategory: Joi.string()
    .valid(
      "moving",
      "plumbing",
      "hvac",
      "electrical",
      "cleaning",
      "landscaping",
      "painting",
      "roofing",
      "flooring",
      "handyman"
    )
    .required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zipCode: Joi.string().required(),
  budgetMin: Joi.number().min(0),
  budgetMax: Joi.number().min(0),
  urgency: Joi.string()
    .valid("low", "medium", "high", "emergency")
    .default("medium"),
  preferredDate: Joi.date().min("now"),
});

// Create a new job
router.post("/", authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { error, value } = jobSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const {
      title,
      description,
      serviceCategory,
      address,
      city,
      state,
      zipCode,
      budgetMin,
      budgetMax,
      urgency,
      preferredDate,
    } = value;

    // Create job
    const [job] = await db("jobs")
      .insert({
        customer_id: req.user.id,
        title,
        description,
        service_category: serviceCategory,
        address,
        city,
        state,
        zip_code: zipCode,
        budget_min: budgetMin,
        budget_max: budgetMax,
        urgency,
        preferred_date: preferredDate,
      })
      .returning("*");

    // Generate matches for the job
    try {
      await matchingService.generateMatches(job.id);
    } catch (matchError) {
      console.error("Error generating matches:", matchError);
      // Don't fail the job creation if matching fails
    }

    res.status(201).json({
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get jobs for current customer
router.get("/my-jobs", authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = db("jobs")
      .where("customer_id", req.user.id)
      .orderBy("created_at", "desc");

    if (status) {
      query = query.where("status", status);
    }

    const offset = (page - 1) * limit;
    const jobs = await query.limit(limit).offset(offset).select("*");

    const total = await db("jobs")
      .where("customer_id", req.user.id)
      .count("* as count")
      .first();

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit),
      },
    });
  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get specific job
router.get("/:jobId", authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await db("jobs")
      .where("id", jobId)
      .where("customer_id", req.user.id)
      .first();

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({ job });
  } catch (error) {
    console.error("Get job error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update job
router.put("/:jobId", authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { jobId } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.customer_id;
    delete updates.created_at;

    const [updatedJob] = await db("jobs")
      .where("id", jobId)
      .where("customer_id", req.user.id)
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .returning("*");

    if (!updatedJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Cancel job
router.post(
  "/:jobId/cancel",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const { jobId } = req.params;
      const { reason } = req.body;

      const [updatedJob] = await db("jobs")
        .where("id", jobId)
        .where("customer_id", req.user.id)
        .update({
          status: "cancelled",
          updated_at: new Date(),
        })
        .returning("*");

      if (!updatedJob) {
        return res.status(404).json({ error: "Job not found" });
      }

      // Cancel all pending matches
      await db("matches")
        .where("job_id", jobId)
        .where("status", "pending")
        .update({ status: "cancelled" });

      res.json({
        message: "Job cancelled successfully",
        job: updatedJob,
      });
    } catch (error) {
      console.error("Cancel job error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
