/**
 * Match/job participation helpers for authorization.
 * Customer = jobs.customer_id; professional = professionals.user_id for the match's professional_id.
 */

/**
 * @returns {Promise<{ kind: 'ok', role: 'customer' | 'professional', match: object }
 *   | { kind: 'not_found' } | { kind: 'forbidden' }>}
 */
async function getMatchAccess(db, matchId, userId) {
  const row = await db("matches")
    .join("jobs", "matches.job_id", "jobs.id")
    .join("professionals", "matches.professional_id", "professionals.id")
    .where("matches.id", matchId)
    .select(
      "matches.id",
      "matches.job_id",
      "matches.professional_id",
      "matches.match_fee",
      "matches.status",
      "jobs.customer_id",
      "professionals.user_id as professional_user_id"
    )
    .first();

  if (!row) {
    const exists = await db("matches").where("id", matchId).first();
    return exists ? { kind: "forbidden" } : { kind: "not_found" };
  }

  if (row.customer_id === userId) {
    return { kind: "ok", role: "customer", match: row };
  }
  if (row.professional_user_id === userId) {
    return { kind: "ok", role: "professional", match: row };
  }
  return { kind: "forbidden" };
}

module.exports = {
  getMatchAccess,
};
