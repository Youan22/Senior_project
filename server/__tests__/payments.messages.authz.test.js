/**
 * Route-level authz: user A must not access user B's match/payment/message flows (403/404/401).
 * Auth middleware is stubbed so tests do not require PostgreSQL.
 */

jest.mock("stripe", () => {
  const paymentIntents = {
    create: jest.fn().mockResolvedValue({
      id: "pi_test_123",
      client_secret: "cs_test_secret",
    }),
    retrieve: jest.fn().mockResolvedValue({
      status: "succeeded",
      metadata: { userId: "user-a", matchId: "match-1" },
    }),
  };
  const Stripe = jest.fn(() => ({ paymentIntents }));
  Stripe.paymentIntents = paymentIntents;
  return Stripe;
});

jest.mock("../middleware/auth", () => ({
  authenticateToken: (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(401).json({ error: "Access token required" });
    }
    const token = auth.split(" ")[1];
    if (token === "tok_user_a") {
      req.user = {
        id: "user-a",
        user_type: "customer",
        is_active: true,
      };
      return next();
    }
    if (token === "tok_user_b") {
      req.user = {
        id: "user-b",
        user_type: "customer",
        is_active: true,
      };
      return next();
    }
    if (token === "tok_prof_a") {
      req.user = {
        id: "user-prof-a",
        user_type: "professional",
        is_active: true,
      };
      return next();
    }
    return res.status(403).json({ error: "Invalid or expired token" });
  },
  requireCustomer: (req, res, next) => next(),
  requireProfessional: (req, res, next) => next(),
}));

jest.mock("../lib/matchMembership", () => ({
  getMatchAccess: jest.fn(),
}));

jest.mock("../db", () => jest.fn());

const request = require("supertest");
const { createApp } = require("../app");
const db = require("../db");
const { getMatchAccess } = require("../lib/matchMembership");
const Stripe = require("stripe");

const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe("Phase 1 route authz (payments + messages)", () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("messages", () => {
    it("returns 401 without token", async () => {
      const res = await request(app).get("/api/messages/match/some-match-id");
      expect(res.status).toBe(401);
    });

    it("returns 403 when user B is not a participant (cross-account)", async () => {
      getMatchAccess.mockResolvedValue({ kind: "forbidden" });
      const res = await request(app)
        .get("/api/messages/match/match-owned-by-a")
        .set(auth("tok_user_b"));
      expect(res.status).toBe(403);
      expect(getMatchAccess).toHaveBeenCalledWith(
        db,
        "match-owned-by-a",
        "user-b"
      );
    });

    it("returns 404 when match does not exist", async () => {
      getMatchAccess.mockResolvedValue({ kind: "not_found" });
      const res = await request(app)
        .get("/api/messages/match/ghost")
        .set(auth("tok_user_a"));
      expect(res.status).toBe(404);
    });

    it("returns 200 for participant listing messages", async () => {
      getMatchAccess.mockResolvedValue({
        kind: "ok",
        role: "customer",
        match: { id: "m1", status: "accepted" },
      });
      db.mockImplementation((table) => {
        if (table === "messages") {
          return {
            join: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            offset: jest.fn().mockResolvedValue([]),
          };
        }
        return {};
      });
      const res = await request(app)
        .get("/api/messages/match/m1")
        .set(auth("tok_user_a"));
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ messages: [] });
    });

    it("POST /send returns 403 for non-member", async () => {
      getMatchAccess.mockResolvedValue({ kind: "forbidden" });
      const res = await request(app)
        .post("/api/messages/send")
        .set(auth("tok_user_b"))
        .send({ matchId: "m1", content: "hi" });
      expect(res.status).toBe(403);
    });

    it("PUT /mark-read returns 403 without match membership", async () => {
      getMatchAccess.mockResolvedValue({ kind: "forbidden" });
      const res = await request(app)
        .put("/api/messages/mark-read")
        .set(auth("tok_user_b"))
        .send({ matchId: "m1" });
      expect(res.status).toBe(403);
      expect(db).not.toHaveBeenCalledWith("messages");
    });

    it("PUT /mark-read updates only after membership check", async () => {
      getMatchAccess.mockResolvedValue({
        kind: "ok",
        role: "customer",
        match: { id: "m1", status: "accepted" },
      });
      const update = jest.fn().mockResolvedValue(1);
      db.mockImplementation((table) => {
        if (table === "messages") {
          return {
            where: jest.fn().mockReturnThis(),
            update,
          };
        }
        return {};
      });
      const res = await request(app)
        .put("/api/messages/mark-read")
        .set(auth("tok_user_a"))
        .send({ matchId: "m1" });
      expect(res.status).toBe(200);
      expect(update).toHaveBeenCalled();
    });
  });

  describe("payments", () => {
    it("returns 401 without token for create-payment-intent", async () => {
      const res = await request(app)
        .post("/api/payments/create-payment-intent")
        .send({ matchId: "m1" });
      expect(res.status).toBe(401);
    });

    it("returns 403 when professional tries to create payment intent", async () => {
      getMatchAccess.mockResolvedValue({
        kind: "ok",
        role: "professional",
        match: { id: "m1", match_fee: 25 },
      });
      const res = await request(app)
        .post("/api/payments/create-payment-intent")
        .set(auth("tok_prof_a"))
        .send({ matchId: "m1" });
      expect(res.status).toBe(403);
      expect(Stripe.paymentIntents.create).not.toHaveBeenCalled();
    });

    it("returns 403 when user B cannot access match (cross-account)", async () => {
      getMatchAccess.mockResolvedValue({ kind: "forbidden" });
      const res = await request(app)
        .post("/api/payments/create-payment-intent")
        .set(auth("tok_user_b"))
        .send({ matchId: "m1" });
      expect(res.status).toBe(403);
    });

    it("customer can create payment intent when getMatchAccess ok", async () => {
      getMatchAccess.mockResolvedValue({
        kind: "ok",
        role: "customer",
        match: { id: "m1", match_fee: 40 },
      });
      const insert = jest.fn().mockResolvedValue([{}]);
      db.mockImplementation((table) => {
        if (table === "payments") {
          return { insert };
        }
        return {};
      });
      const res = await request(app)
        .post("/api/payments/create-payment-intent")
        .set(auth("tok_user_a"))
        .send({ matchId: "m1" });
      expect(res.status).toBe(200);
      expect(res.body.clientSecret).toBe("cs_test_secret");
      expect(insert).toHaveBeenCalled();
    });

    it("confirm-payment returns 403 when user B does not own the payment", async () => {
      db.mockImplementation((table) => {
        if (table === "payments") {
          return {
            join: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue({
              match_id: "m1",
              stripe_payment_intent_id: "pi_x",
              customer_id: "user-a",
            }),
          };
        }
        return {};
      });
      Stripe.paymentIntents.retrieve.mockClear();

      const res = await request(app)
        .post("/api/payments/confirm-payment")
        .set(auth("tok_user_b"))
        .send({ paymentIntentId: "pi_x" });

      expect(res.status).toBe(403);
      expect(Stripe.paymentIntents.retrieve).not.toHaveBeenCalled();
    });

    it("confirm-payment returns 404 when payment intent unknown", async () => {
      db.mockImplementation((table) => {
        if (table === "payments") {
          return {
            join: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue(null),
          };
        }
        return {};
      });
      const res = await request(app)
        .post("/api/payments/confirm-payment")
        .set(auth("tok_user_a"))
        .send({ paymentIntentId: "pi_missing" });
      expect(res.status).toBe(404);
    });

    it("confirm-payment rejects when Stripe metadata userId does not match caller", async () => {
      db.mockImplementation((table) => {
        if (table === "payments") {
          return {
            join: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue({
              match_id: "m1",
              stripe_payment_intent_id: "pi_x",
              customer_id: "user-a",
            }),
          };
        }
        return {};
      });
      Stripe.paymentIntents.retrieve.mockResolvedValue({
        status: "succeeded",
        metadata: { userId: "someone-else", matchId: "m1" },
      });

      const res = await request(app)
        .post("/api/payments/confirm-payment")
        .set(auth("tok_user_a"))
        .send({ paymentIntentId: "pi_x" });

      expect(res.status).toBe(403);
    });
  });
});
