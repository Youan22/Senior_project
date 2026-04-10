const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = require("../db");
const { authenticateToken } = require("../middleware/auth");
const { getMatchAccess } = require("../lib/matchMembership");

const router = express.Router();

// Create payment intent for match fee (customer only — payer)
router.post("/create-payment-intent", authenticateToken, async (req, res) => {
  try {
    const { matchId } = req.body;

    const access = await getMatchAccess(db, matchId, req.user.id);
    if (access.kind === "not_found") {
      return res.status(404).json({ error: "Match not found" });
    }
    if (access.kind === "forbidden") {
      return res.status(403).json({ error: "Access denied for this match" });
    }
    if (access.role !== "customer") {
      return res.status(403).json({
        error: "Only the job owner may create a payment for this match",
      });
    }

    const { match } = access;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(match.match_fee * 100),
      currency: "usd",
      metadata: {
        matchId: String(matchId),
        userId: String(req.user.id),
      },
    });

    await db("payments").insert({
      match_id: matchId,
      stripe_payment_intent_id: paymentIntent.id,
      amount: match.match_fee,
      status: "pending",
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Confirm payment (only the customer who owns the job / created the intent)
router.post("/confirm-payment", authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const payment = await db("payments")
      .join("matches", "payments.match_id", "matches.id")
      .join("jobs", "matches.job_id", "jobs.id")
      .where("payments.stripe_payment_intent_id", paymentIntentId)
      .select("payments.*", "jobs.customer_id")
      .first();

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    if (payment.customer_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied for this payment" });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (
      paymentIntent.metadata &&
      paymentIntent.metadata.userId &&
      paymentIntent.metadata.userId !== String(req.user.id)
    ) {
      return res.status(403).json({ error: "Access denied for this payment" });
    }

    if (paymentIntent.status === "succeeded") {
      await db("payments")
        .where("stripe_payment_intent_id", paymentIntentId)
        .update({ status: "succeeded" });

      const updated = await db("payments")
        .where("stripe_payment_intent_id", paymentIntentId)
        .first();

      if (updated) {
        await db("matches")
          .where("id", updated.match_id)
          .update({ status: "accepted" });
      }

      res.json({ message: "Payment confirmed successfully" });
    } else {
      res.status(400).json({ error: "Payment not successful" });
    }
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get payment history (customer's own jobs only — unchanged)
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const payments = await db("payments")
      .join("matches", "payments.match_id", "matches.id")
      .join("jobs", "matches.job_id", "jobs.id")
      .where("jobs.customer_id", req.user.id)
      .select(
        "payments.*",
        "jobs.title",
        "jobs.service_category",
        "matches.created_at as match_created_at"
      )
      .orderBy("payments.created_at", "desc");

    res.json({ payments });
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
