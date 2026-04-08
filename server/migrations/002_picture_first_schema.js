exports.up = function (knex) {
  return knex.schema
    // Add image fields to professionals table
    .alterTable("professionals", (table) => {
      table.string("profile_image_url"); // Primary profile photo
      table.json("work_gallery"); // Array of work photos
      table.boolean("has_video").defaultTo(false); // Video upgrade flag
      table.boolean("is_premium").defaultTo(false); // Premium profile status
    })
    
    // Create professional_images table for work gallery
    .createTable("professional_images", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("professional_id")
        .references("id")
        .inTable("professionals")
        .onDelete("CASCADE");
      table.string("image_url").notNullable();
      table.string("caption");
      table.string("image_type").defaultTo("work"); // work, before_after, team, etc.
      table.integer("sort_order").defaultTo(0);
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })
    
    // Update professional_videos table to be optional
    .alterTable("professional_videos", (table) => {
      table.boolean("is_premium").defaultTo(false); // Premium video content
      table.string("video_category"); // intro, work_process, testimonial, etc.
    })
    
    // Create premium features table
    .createTable("premium_features", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("professional_id")
        .references("id")
        .inTable("professionals")
        .onDelete("CASCADE");
      table.string("feature_type").notNullable(); // video, priority_listing, analytics
      table.boolean("is_active").defaultTo(true);
      table.timestamp("expires_at");
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })
    
    // Add image support to jobs table
    .alterTable("jobs", (table) => {
      table.json("job_images"); // Customer can upload photos of the job
      table.string("preferred_contact_method").defaultTo("message"); // message, call, video
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("premium_features")
    .dropTableIfExists("professional_images")
    .alterTable("professional_videos", (table) => {
      table.dropColumn("is_premium");
      table.dropColumn("video_category");
    })
    .alterTable("professionals", (table) => {
      table.dropColumn("profile_image_url");
      table.dropColumn("work_gallery");
      table.dropColumn("has_video");
      table.dropColumn("is_premium");
    })
    .alterTable("jobs", (table) => {
      table.dropColumn("job_images");
      table.dropColumn("preferred_contact_method");
    });
};












