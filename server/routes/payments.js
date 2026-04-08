const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = require("../db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Create payment intent for match fee
router.post("/create-payment-intent", authenticateToken, async (req, res) => {
  try {
    const { matchId } = req.body;

    // Get match details
    const match = await db("matches").where("id", matchId).first();

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(match.match_fee * 100), // Convert to cents
      currency: "usd",
      metadata: {
        matchId: matchId,
        userId: req.user.id,
      },
    });

    // Store payment intent in database
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

// Confirm payment
router.post("/confirm-payment", authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      // Update payment status in database
      await db("payments")
        .where("stripe_payment_intent_id", paymentIntentId)
        .update({ status: "succeeded" });

      // Update match status
      const payment = await db("payments")
        .where("stripe_payment_intent_id", paymentIntentId)
        .first();

      if (payment) {
        await db("matches")
          .where("id", payment.match_id)
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

// Get payment history
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
