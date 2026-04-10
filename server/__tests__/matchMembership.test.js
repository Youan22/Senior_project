const { getMatchAccess } = require("../lib/matchMembership");

describe("getMatchAccess", () => {
  it("returns not_found when match does not exist", async () => {
    let calls = 0;
    const db = jest.fn(() => {
      calls++;
      if (calls === 1) {
        return {
          join: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(null),
        };
      }
      return {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      };
    });
    const result = await getMatchAccess(db, "missing-id", "user-1");
    expect(result).toEqual({ kind: "not_found" });
  });

  it("returns forbidden when join fails but match row exists (orphan / integrity edge)", async () => {
    let calls = 0;
    const db = jest.fn(() => {
      calls++;
      if (calls === 1) {
        return {
          join: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(null),
        };
      }
      return {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ id: "m1" }),
      };
    });
    const result = await getMatchAccess(db, "m1", "user-1");
    expect(result).toEqual({ kind: "forbidden" });
  });

  it("returns forbidden when match exists but user is not a participant", async () => {
    const joinRow = {
      id: "m1",
      job_id: "j1",
      professional_id: "p1",
      match_fee: 50,
      status: "pending",
      customer_id: "cust-1",
      professional_user_id: "prof-1",
    };
    const db = jest.fn(() => ({
      join: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(joinRow),
    }));
    const result = await getMatchAccess(db, "m1", "stranger");
    expect(result).toEqual({ kind: "forbidden" });
  });

  it("returns ok customer when user owns the job", async () => {
    const joinRow = {
      id: "m1",
      job_id: "j1",
      professional_id: "p1",
      match_fee: 50,
      status: "pending",
      customer_id: "cust-1",
      professional_user_id: "prof-1",
    };
    const db = jest.fn(() => ({
      join: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(joinRow),
    }));
    const result = await getMatchAccess(db, "m1", "cust-1");
    expect(result.kind).toBe("ok");
    expect(result.role).toBe("customer");
    expect(result.match.id).toBe("m1");
  });

  it("returns ok professional when user is the matched professional", async () => {
    const joinRow = {
      id: "m1",
      job_id: "j1",
      professional_id: "p1",
      match_fee: 50,
      status: "pending",
      customer_id: "cust-1",
      professional_user_id: "prof-1",
    };
    const db = jest.fn(() => ({
      join: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(joinRow),
    }));
    const result = await getMatchAccess(db, "m1", "prof-1");
    expect(result.kind).toBe("ok");
    expect(result.role).toBe("professional");
  });
});
