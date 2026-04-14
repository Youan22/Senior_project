exports.up = function (knex) {
  return knex.schema.alterTable("matches", (table) => {
    table.timestamp("professional_completed_at");
    table.timestamp("customer_completed_at");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("matches", (table) => {
    table.dropColumn("professional_completed_at");
    table.dropColumn("customer_completed_at");
  });
};

