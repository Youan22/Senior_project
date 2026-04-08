const jwt = require("jsonwebtoken");
const db = require("../db");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database to ensure they still exist and are active
    const user = await db("users")
      .where({ id: decoded.userId, is_active: true })
      .first();

    if (!user) {
      return res.status(401).json({ error: "Invalid token or user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

const requireUserType = (userType) => {
  return (req, res, next) => {
    if (req.user.user_type !== userType) {
      return res
        .status(403)
        .json({ error: `Access denied. ${userType} account required.` });
    }
    next();
  };
};

const requireProfessional = requireUserType("professional");
const requireCustomer = requireUserType("customer");

module.exports = {
  authenticateToken,
  requireProfessional,
  requireCustomer,
};
