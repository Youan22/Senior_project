const express = require("express");
const Joi = require("joi");
const db = require("../db");
const {
  authenticateToken,
  requireProfessional,
} = require("../middleware/auth");

const router = express.Router();

/**
 * Accept camelCase (preferred) or legacy snake_case from older clients / cached bundles.
 */
function normalizeProfessionalProfileBody(body) {
  if (!body || typeof body !== "object") {
    return {};
  }
  const b = body;
  const str = (v) => (v == null ? "" : String(v));
  const toFiniteNumber = (v, fallback) => {
    if (v === null || v === undefined || v === "") return fallback;
    const n = typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, ""));
    return Number.isFinite(n) ? n : fallback;
  };
  const toInt = (v, fallback) => {
    const n = parseInt(String(v ?? ""), 10);
    return Number.isFinite(n) ? n : fallback;
  };
  const areas = b.serviceAreas ?? b.service_areas;
  const serviceAreas = Array.isArray(areas) ? areas.map(String) : [];

  let insuranceInfo = b.insuranceInfo ?? b.insurance_info;
  if (insuranceInfo == null) {
    insuranceInfo = {};
  } else if (typeof insuranceInfo === "string" && insuranceInfo.trim()) {
    insuranceInfo = { notes: insuranceInfo.trim() };
  } else if (typeof insuranceInfo !== "object" || Array.isArray(insuranceInfo)) {
    insuranceInfo = {};
  } else {
    const rawIns = insuranceInfo;
    insuranceInfo = {
      provider: rawIns.provider != null ? String(rawIns.provider) : "",
      policyNumber:
        rawIns.policyNumber != null ? String(rawIns.policyNumber) : "",
      notes: rawIns.notes != null ? String(rawIns.notes) : "",
    };
    if (rawIns.coverageAmount != null && rawIns.coverageAmount !== "") {
      const ca = Number(rawIns.coverageAmount);
      if (Number.isFinite(ca)) {
        insuranceInfo.coverageAmount = ca;
      }
    }
  }

  const businessName = str(b.businessName ?? b.business_name).trim();
  const description = str(b.description ?? b.bio);
  const serviceCategory = str(b.serviceCategory ?? b.service_category).trim();
  const hourlyRate = toFiniteNumber(b.hourlyRate ?? b.hourly_rate, undefined);
  let matchFee = toFiniteNumber(b.matchFee ?? b.match_fee, undefined);
  if (matchFee === undefined) {
    matchFee = 25;
  }

  let isAvailable = b.isAvailable;
  if (isAvailable === undefined && b.is_available !== undefined) {
    isAvailable = b.is_available;
  }

  let certifications = b.certifications;
  if (!Array.isArray(certifications)) {
    certifications = [];
  }

  return {
    businessName,
    description,
    serviceCategory,
    licenseNumber: str(b.licenseNumber ?? b.license_number),
    licenseState: str(b.licenseState ?? b.license_state),
    serviceAreas,
    hourlyRate,
    matchFee,
    yearsExperience: toInt(b.yearsExperience ?? b.years_experience, 0),
    certifications,
    insuranceInfo,
    isAvailable,
  };
}

/** Fill gaps from DB row when the client omits fields (stale bundles, partial JSON). */
function mergeProfessionalProfileFromExisting(normalized, existing) {
  if (!existing) {
    return normalized;
  }
  const out = { ...normalized };
  if (!out.businessName && existing.business_name) {
    out.businessName = String(existing.business_name).trim();
  }
  if (!out.serviceCategory && existing.service_category) {
    out.serviceCategory = String(existing.service_category).trim();
  }
  if (
    (out.hourlyRate === undefined || !Number.isFinite(out.hourlyRate)) &&
    existing.hourly_rate != null &&
    existing.hourly_rate !== ""
  ) {
    const h = parseFloat(existing.hourly_rate);
    if (Number.isFinite(h)) {
      out.hourlyRate = h;
    }
  }
  if (
    (out.matchFee === undefined || !Number.isFinite(out.matchFee)) &&
    existing.match_fee != null &&
    existing.match_fee !== ""
  ) {
    const m = parseFloat(existing.match_fee);
    if (Number.isFinite(m)) {
      out.matchFee = m;
    }
  }
  if (!out.serviceAreas || out.serviceAreas.length === 0) {
    if (existing.service_areas) {
      try {
        const parsed = JSON.parse(existing.service_areas);
        if (Array.isArray(parsed) && parsed.length > 0) {
          out.serviceAreas = parsed.map(String);
        }
      } catch (_) {
        /* ignore */
      }
    }
  }
  return out;
}

// Validation schema (after normalization)
const professionalSchema = Joi.object({
  businessName: Joi.string().trim().min(1).required(),
  description: Joi.string().allow("").default(""),
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
  serviceAreas: Joi.array().items(Joi.string()).min(1).required(),
  hourlyRate: Joi.number().min(0).required(),
  matchFee: Joi.number().min(0).required(),
  yearsExperience: Joi.number().min(0).default(0),
  certifications: Joi.array().items(Joi.string()).default([]),
  insuranceInfo: Joi.object({
    provider: Joi.string().allow(""),
    policyNumber: Joi.string().allow(""),
    coverageAmount: Joi.number(),
    notes: Joi.string().allow(""),
  }).default({}),
  isAvailable: Joi.boolean(),
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
      const existingProfessional = await db("professionals")
        .where("user_id", req.user.id)
        .first();

      let normalized = normalizeProfessionalProfileBody(
        req.body && typeof req.body === "object" ? req.body : {}
      );
      normalized = mergeProfessionalProfileFromExisting(
        normalized,
        existingProfessional
      );

      const { error, value } = professionalSchema.validate(normalized, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });
      if (error) {
        const messages = error.details.map((d) => d.message).join("; ");
        if (process.env.NODE_ENV !== "production") {
          console.error("[PUT /api/professionals/profile] validation failed", {
            bodyKeys: req.body && Object.keys(req.body),
            normalized,
            joi: error.details,
          });
        }
        const payload = {
          error: error.details[0].message,
          details: messages,
        };
        if (process.env.NODE_ENV !== "production") {
          payload.issues = error.details.map((d) => ({
            path: d.path.join("."),
            message: d.message,
          }));
        }
        return res.status(400).json(payload);
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
        isAvailable,
      } = value;

      let professional;
      if (existingProfessional) {
        // Update existing profile
        const updateRow = {
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
        };
        if (typeof isAvailable === "boolean") {
          updateRow.is_available = isAvailable;
        }
        [professional] = await db("professionals")
          .where("user_id", req.user.id)
          .update(updateRow)
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
            is_available:
              typeof isAvailable === "boolean" ? isAvailable : true,
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
