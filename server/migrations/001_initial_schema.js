exports.up = function (knex) {
  return knex.schema
    .createTable("users", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table.string("email").unique().notNullable();
      table.string("password_hash").notNullable();
      table.string("first_name").notNullable();
      table.string("last_name").notNullable();
      table.string("phone").notNullable();
      table.enum("user_type", ["customer", "professional"]).notNullable();
      table.string("profile_image_url");
      table.boolean("is_verified").defaultTo(false);
      table.boolean("is_active").defaultTo(true);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })

    .createTable("professionals", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("user_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.string("business_name").notNullable();
      table.text("description");
      table.string("license_number");
      table.string("license_state");
      table
        .enum("service_category", [
          "moving",
          "plumbing",
          "hvac",
          "electrical",
          "cleaning",
          "landscaping",
          "painting",
          "roofing",
          "flooring",
          "handyman",
        ])
        .notNullable();
      table.json("service_areas"); // Array of zip codes or cities
      table.decimal("hourly_rate", 10, 2);
      table.decimal("match_fee", 10, 2).notNullable();
      table.integer("years_experience");
      table.json("certifications");
      table.json("insurance_info");
      table.decimal("rating", 3, 2).defaultTo(0);
      table.integer("total_reviews").defaultTo(0);
      table.boolean("is_verified").defaultTo(false);
      table.boolean("is_available").defaultTo(true);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })

    .createTable("professional_videos", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("professional_id")
        .references("id")
        .inTable("professionals")
        .onDelete("CASCADE");
      table.string("video_url").notNullable();
      table.string("thumbnail_url");
      table.integer("duration_seconds");
      table.text("description");
      table.boolean("is_primary").defaultTo(false);
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })

    .createTable("jobs", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("customer_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.string("title").notNullable();
      table.text("description").notNullable();
      table
        .enum("service_category", [
          "moving",
          "plumbing",
          "hvac",
          "electrical",
          "cleaning",
          "landscaping",
          "painting",
          "roofing",
          "flooring",
          "handyman",
        ])
        .notNullable();
      table.string("address").notNullable();
      table.string("city").notNullable();
      table.string("state").notNullable();
      table.string("zip_code").notNullable();
      table.decimal("budget_min", 10, 2);
      table.decimal("budget_max", 10, 2);
      table
        .enum("urgency", ["low", "medium", "high", "emergency"])
        .defaultTo("medium");
      table
        .enum("status", [
          "open",
          "matched",
          "in_progress",
          "completed",
          "cancelled",
        ])
        .defaultTo("open");
      table.timestamp("preferred_date");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })

    .createTable("matches", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table.uuid("job_id").references("id").inTable("jobs").onDelete("CASCADE");
      table
        .uuid("professional_id")
        .references("id")
        .inTable("professionals")
        .onDelete("CASCADE");
      table
        .enum("status", ["pending", "accepted", "declined", "expired"])
        .defaultTo("pending");
      table.decimal("match_fee", 10, 2).notNullable();
      table.boolean("customer_swiped").defaultTo(false);
      table.boolean("professional_swiped").defaultTo(false);
      table.timestamp("expires_at");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })

    .createTable("messages", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("match_id")
        .references("id")
        .inTable("matches")
        .onDelete("CASCADE");
      table
        .uuid("sender_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.text("content").notNullable();
      table.string("message_type").defaultTo("text"); // text, image, video, file
      table.string("attachment_url");
      table.boolean("is_read").defaultTo(false);
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })

    .createTable("payments", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("match_id")
        .references("id")
        .inTable("matches")
        .onDelete("CASCADE");
      table.string("stripe_payment_intent_id").notNullable();
      table.decimal("amount", 10, 2).notNullable();
      table.string("currency").defaultTo("usd");
      table
        .enum("status", ["pending", "succeeded", "failed", "cancelled"])
        .defaultTo("pending");
      table.string("failure_reason");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })

    .createTable("reviews", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table.uuid("job_id").references("id").inTable("jobs").onDelete("CASCADE");
      table
        .uuid("customer_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table
        .uuid("professional_id")
        .references("id")
        .inTable("professionals")
        .onDelete("CASCADE");
      table.integer("rating").notNullable(); // 1-5 stars
      table.text("comment");
      table.timestamp("created_at").defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("reviews")
    .dropTableIfExists("payments")
    .dropTableIfExists("messages")
    .dropTableIfExists("matches")
    .dropTableIfExists("jobs")
    .dropTableIfExists("professional_videos")
    .dropTableIfExists("professionals")
    .dropTableIfExists("users");
};
