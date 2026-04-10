/**
 * CORS origins for Express and Socket.io.
 * In development, any http(s)://localhost or 127.0.0.1 with a port is allowed
 * so Next.js can move between 3000, 3001, etc. without .env edits.
 */

function parseExtraOrigins() {
  return (process.env.CLIENT_URLS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function getExplicitOrigins() {
  const set = new Set(parseExtraOrigins());
  if (process.env.CLIENT_URL) {
    set.add(process.env.CLIENT_URL.trim());
  }
  if (set.size === 0) {
    set.add("http://localhost:3000");
  }
  return [...set];
}

const LOCAL_DEV_ORIGIN =
  /^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d{1,5})?$/i;

function isProduction() {
  return process.env.NODE_ENV === "production";
}

/** Used by Socket.io `cors.origin` (array form). */
function getAllowedOrigins() {
  const list = getExplicitOrigins();
  if (!isProduction()) {
    for (let port = 3000; port <= 3010; port++) {
      list.push(`http://localhost:${port}`);
      list.push(`http://127.0.0.1:${port}`);
    }
  }
  return [...new Set(list)];
}

/** Used by Express `cors({ origin })`. */
function createExpressCorsOrigin() {
  const explicit = new Set(getExplicitOrigins());

  return (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (explicit.has(origin)) {
      return callback(null, true);
    }
    if (!isProduction() && LOCAL_DEV_ORIGIN.test(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  };
}

module.exports = {
  getAllowedOrigins,
  createExpressCorsOrigin,
};
