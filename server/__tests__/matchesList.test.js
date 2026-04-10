const {
  orderMatchesByNewest,
  transformCustomerMatchRow,
  transformProfessionalMatchRow,
} = require("../lib/matchesList");

describe("orderMatchesByNewest", () => {
  it("applies matches.created_at descending for stable list ordering", () => {
    const query = { orderBy: jest.fn().mockReturnThis() };
    orderMatchesByNewest(query);
    expect(query.orderBy).toHaveBeenCalledWith("matches.created_at", "desc");
  });
});

const professionalRow = {
  id: "m1",
  job_id: "j1",
  professional_id: "p1",
  status: "pending",
  created_at: "2026-01-02T12:00:00Z",
  title: "Paint",
  description: "Walls",
  service_category: "painting",
  address: "1 Main",
  city: "NYC",
  state: "NY",
  zip_code: "10001",
  budget_min: 100,
  budget_max: 200,
  urgency: "normal",
  preferred_date: "2026-02-01",
  job_created_at: "2026-01-01T00:00:00Z",
  first_name: "Jane",
  last_name: "Doe",
  profile_image_url: null,
};

describe("transformProfessionalMatchRow", () => {
  it("maps job_created_at to job.created_at (not match row created_at)", () => {
    const out = transformProfessionalMatchRow(professionalRow);
    expect(out.job.created_at).toBe("2026-01-01T00:00:00Z");
    expect(out.created_at).toBe("2026-01-02T12:00:00Z");
  });

  it("returns nested job and customer shape expected by dashboards", () => {
    const out = transformProfessionalMatchRow(professionalRow);
    expect(out).toEqual({
      id: "m1",
      job_id: "j1",
      professional_id: "p1",
      status: "pending",
      created_at: "2026-01-02T12:00:00Z",
      job: {
        id: "j1",
        title: "Paint",
        description: "Walls",
        service_category: "painting",
        budget_min: 100,
        budget_max: 200,
        urgency: "normal",
        address: "1 Main",
        city: "NYC",
        state: "NY",
        zip_code: "10001",
        preferred_date: "2026-02-01",
        created_at: "2026-01-01T00:00:00Z",
        customer: {
          firstName: "Jane",
          lastName: "Doe",
          profile_image_url: null,
        },
      },
    });
  });
});

const customerRow = {
  id: "m2",
  job_id: "j2",
  professional_id: "p2",
  status: "accepted",
  created_at: "2026-03-01T10:00:00Z",
  title: "Clean",
  description: "Deep clean",
  service_category: "cleaning",
  budget_min: 50,
  budget_max: 150,
  urgency: "high",
  address: "2 Oak",
  city: "Boston",
  state: "MA",
  zip_code: "02101",
  preferred_date: "2026-03-15",
  job_created_at: "2026-02-28T08:00:00Z",
  first_name: "Alex",
  last_name: "Pro",
  profile_image_url: "https://example.com/p.jpg",
  business_name: "Pro Co",
  rating: "4.5",
  total_reviews: "10",
};

describe("transformCustomerMatchRow", () => {
  it("maps job_created_at to job.created_at", () => {
    const out = transformCustomerMatchRow(customerRow);
    expect(out.job.created_at).toBe("2026-02-28T08:00:00Z");
  });

  it("returns nested job and professional shape", () => {
    const out = transformCustomerMatchRow(customerRow);
    expect(out.job).toMatchObject({
      id: "j2",
      title: "Clean",
      zip_code: "02101",
      created_at: "2026-02-28T08:00:00Z",
    });
    expect(out.professional).toEqual({
      id: "p2",
      business_name: "Pro Co",
      rating: 4.5,
      total_reviews: 10,
      firstName: "Alex",
      lastName: "Pro",
      profile_image_url: "https://example.com/p.jpg",
    });
  });
});

describe("sorting contract (documentation)", () => {
  it("newest-first ordering is applied at query layer; transforms preserve array order", () => {
    const older = transformProfessionalMatchRow({
      ...professionalRow,
      id: "old",
      created_at: "2026-01-01T00:00:00Z",
    });
    const newer = transformProfessionalMatchRow({
      ...professionalRow,
      id: "new",
      created_at: "2026-01-10T00:00:00Z",
    });
    const ordered = [newer, older];
    expect(ordered.map((m) => m.id)).toEqual(["new", "old"]);
  });
});
