const express = require("express");
const Joi = require("joi");
const db = require("../db");
const {
  authenticateToken,
  requireProfessional,
} = require("../middleware/auth");

const router = express.Router();

// Validation schema
const professionalSchema = Joi.object({
  businessName: Joi.string().required(),
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
  licenseNumber: Joi.string().allow(""),
  licenseState: Joi.string().allow(""),
  serviceAreas: Joi.array().items(Joi.string()).required(),
  hourlyRate: Joi.number().min(0),
  matchFee: Joi.number().min(0).required(),
  yearsExperience: Joi.number().min(0),
  certifications: Joi.array().items(Joi.string()),
  insuranceInfo: Joi.object({
    provider: Joi.string(),
    policyNumber: Joi.string(),
    coverageAmount: Joi.number(),
  }),
});

// Get professional profile
router.get(
  "/profile",
  authenticateToken,
  requireProfessional,
  async (req, res) => {
    try {
      const professional = await db("professionals")
        .join("users", "professionals.user_id", "users.id")
        .where("professionals.user_id", req.user.id)
        .select(
          "professionals.*",
          "users.first_name",
          "users.last_name",
          "users.email",
          "users.phone",
          "users.profile_image_url"
        )
        .first();

      if (!professional) {
        return res
          .status(404)
          .json({ error: "Professional profile not found" });
      }

      // Get professional videos
      const videos = await db("professional_videos")
        .where("professional_id", professional.id)
        .orderBy("is_primary", "desc")
        .orderBy("created_at", "asc");

      // Parse JSON fields and ensure proper types
      const parsedProfessional = {
        ...professional,
        service_areas: professional.service_areas
          ? JSON.parse(professional.service_areas)
          : [],
        certifications: professional.certifications
          ? JSON.parse(professional.certifications)
          : [],
        insurance_info: professional.insurance_info
          ? JSON.parse(professional.insurance_info)
          : {},
        rating: professional.rating ? parseFloat(professional.rating) : 0,
        hourly_rate: professional.hourly_rate
          ? parseFloat(professional.hourly_rate)
          : 0,
        years_experience: professional.years_experience
          ? parseInt(professional.years_experience)
          : 0,
        total_reviews: professional.total_reviews
          ? parseInt(professional.total_reviews)
          : 0,
        videos,
      };

      res.json({
        professional: parsedProfessional,
      });
    } catch (error) {
      console.error("Get professional profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Create or update professional profile
router.put(
  "/profile",
  authenticateToken,
  requireProfessional,
  async (req, res) => {
    try {
      const { error, value } = professionalSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const {
        businessName,
        description,
        serviceCategory,
        licenseNumber,
        licenseState,
        serviceAreas,
        hourlyRate,
        matchFee,
        yearsExperience,
        certifications,
        insuranceInfo,
      } = value;

      // Check if professional profile exists
      const existingProfessional = await db("professionals")
        .where("user_id", req.user.id)
        .first();

      let professional;
      if (existingProfessional) {
        // Update existing profile
        [professional] = await db("professionals")
          .where("user_id", req.user.id)
          .update({
            business_name: businessName,
            description,
            service_category: serviceCategory,
            license_number: licenseNumber,
            license_state: licenseState,
            service_areas: JSON.stringify(serviceAreas),
            hourly_rate: hourlyRate,
            match_fee: matchFee,
            years_experience: yearsExperience,
            certifications: JSON.stringify(certifications || []),
            insurance_info: JSON.stringify(insuranceInfo || {}),
            updated_at: new Date(),
          })
          .returning("*");
      } else {
        // Create new profile
        [professional] = await db("professionals")
          .insert({
            user_id: req.user.id,
            business_name: businessName,
            description,
            service_category: serviceCategory,
            license_number: licenseNumber,
            license_state: licenseState,
            service_areas: JSON.stringify(serviceAreas),
            hourly_rate: hourlyRate,
            match_fee: matchFee,
            years_experience: yearsExperience,
            certifications: JSON.stringify(certifications || []),
            insurance_info: JSON.stringify(insuranceInfo || {}),
          })
          .returning("*");
      }

      res.json({
        message: "Professional profile updated successfully",
        professional,
      });
    } catch (error) {
      console.error("Update professional profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Upload professional video
router.post(
  "/videos",
  authenticateToken,
  requireProfessional,
  async (req, res) => {
    try {
      const { videoUrl, thumbnailUrl, duration, description, isPrimary } =
        req.body;

      // Get professional ID
      const professional = await db("professionals")
        .where("user_id", req.user.id)
        .first();

      if (!professional) {
        return res
          .status(404)
          .json({ error: "Professional profile not found" });
      }

      // If this is set as primary, unset other primary videos
      if (isPrimary) {
        await db("professional_videos")
          .where("professional_id", professional.id)
          .update({ is_primary: false });
      }

      // Create video record
      const [video] = await db("professional_videos")
        .insert({
          professional_id: professional.id,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          duration_seconds: duration,
          description,
          is_primary: isPrimary || false,
        })
        .returning("*");

      res.status(201).json({
        message: "Video uploaded successfully",
        video,
      });
    } catch (error) {
      console.error("Upload video error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get professional videos
router.get(
  "/videos",
  authenticateToken,
  requireProfessional,
  async (req, res) => {
    try {
      const professional = await db("professionals")
        .where("user_id", req.user.id)
        .first();

      if (!professional) {
        return res
          .status(404)
          .json({ error: "Professional profile not found" });
      }

      const videos = await db("professional_videos")
        .where("professional_id", professional.id)
        .orderBy("is_primary", "desc")
        .orderBy("created_at", "asc");

      res.json({ videos });
    } catch (error) {
      console.error("Get videos error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
