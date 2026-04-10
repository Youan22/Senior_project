const db = require("../db");

class MatchingService {
  isDemoMode() {
    return process.env.NODE_ENV !== "production";
  }

  // Generate matches for a job
  async generateMatches(jobId) {
    try {
      const job = await db("jobs").where("id", jobId).first();
      if (!job) {
        throw new Error("Job not found");
      }

      // Find matching professionals
      const professionals = await this.findMatchingProfessionals(job);

      // Create matches
      const matches = [];
      for (const professional of professionals) {
        const match = await this.createMatch(
          jobId,
          professional.id,
          professional.match_fee
        );
        matches.push(match);
      }

      return matches;
    } catch (error) {
      console.error("Error generating matches:", error);
      throw error;
    }
  }

  // Find professionals that match job criteria
  async findMatchingProfessionals(job) {
    const { service_category, city, state, budget_min, budget_max, urgency } =
      job;

    const demoMode = this.isDemoMode();
    let query = db("professionals")
      .join("users", "professionals.user_id", "users.id")
      .where("professionals.service_category", service_category)
      .where("professionals.is_available", true)
      .where("users.is_active", true);

    // In production we require verified professionals only.
    if (!demoMode) {
      query = query.where("professionals.is_verified", true);
    }

    // Filter by service areas (zip codes or cities)
    // In demo mode, allow wider discovery even if service_areas are empty/legacy.
    if (!demoMode) {
      query = query.where(function () {
        this.whereRaw("service_areas::text LIKE ?", [`%"${city}"%`])
          .orWhereRaw("service_areas::text LIKE ?", [`%"${state}"%`])
          .orWhereRaw("service_areas::text LIKE ?", [`%"${job.zip_code}"%`]);
      });
    }

    // Budget filtering
    if (budget_min && budget_max) {
      query = query.where(function () {
        this.where("hourly_rate", ">=", budget_min * 0.8) // Allow some flexibility
          .where("hourly_rate", "<=", budget_max * 1.2);
      });
    }

    // Urgency-based filtering
    if (urgency === "emergency") {
      query = query.where("is_available", true); // Only available professionals
    }

    // Order by rating and experience
    const professionals = await query
      .orderBy("professionals.rating", "desc")
      .orderBy("professionals.years_experience", "desc")
      .orderBy("professionals.total_reviews", "desc")
      .limit(20) // Limit to top 20 matches
      .select(
        "professionals.*",
        "users.first_name",
        "users.last_name",
        "users.profile_image_url"
      );

    return professionals;
  }

  // Create a match between job and professional
  async createMatch(jobId, professionalId, matchFee) {
    try {
      // Check if match already exists
      const existingMatch = await db("matches")
        .where("job_id", jobId)
        .where("professional_id", professionalId)
        .first();

      if (existingMatch) {
        return existingMatch;
      }

      // Calculate expiration time (24 hours for regular, 2 hours for emergency)
      const job = await db("jobs").where("id", jobId).first();
      const expirationHours = job.urgency === "emergency" ? 2 : 24;
      const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

      // Create match
      const [match] = await db("matches")
        .insert({
          job_id: jobId,
          professional_id: professionalId,
          match_fee: matchFee,
          expires_at: expiresAt,
          status: "pending",
        })
        .returning("*");

      return match;
    } catch (error) {
      console.error("Error creating match:", error);
      throw error;
    }
  }

  // Get match score for a professional (for ranking)
  calculateMatchScore(professional, job) {
    let score = 0;

    // Rating score (0-50 points)
    score += (professional.rating / 5) * 50;

    // Experience score (0-30 points)
    const experienceScore =
      Math.min(professional.years_experience / 10, 1) * 30;
    score += experienceScore;

    // Review count score (0-20 points)
    const reviewScore = Math.min(professional.total_reviews / 50, 1) * 20;
    score += reviewScore;

    // Budget alignment (bonus/penalty)
    if (job.budget_min && job.budget_max && professional.hourly_rate) {
      const budgetMid = (job.budget_min + job.budget_max) / 2;
      const rateDiff =
        Math.abs(professional.hourly_rate - budgetMid) / budgetMid;

      if (rateDiff <= 0.1) {
        score += 10; // Within 10% of budget
      } else if (rateDiff <= 0.2) {
        score += 5; // Within 20% of budget
      } else {
        score -= 5; // Outside 20% of budget
      }
    }

    return Math.round(score);
  }

  // Clean up expired matches
  async cleanupExpiredMatches() {
    try {
      const expiredMatches = await db("matches")
        .where("status", "pending")
        .where("expires_at", "<", new Date());

      if (expiredMatches.length > 0) {
        await db("matches")
          .whereIn(
            "id",
            expiredMatches.map((m) => m.id)
          )
          .update({ status: "expired" });

        console.log(`Cleaned up ${expiredMatches.length} expired matches`);
      }
    } catch (error) {
      console.error("Error cleaning up expired matches:", error);
    }
  }
}

module.exports = new MatchingService();
