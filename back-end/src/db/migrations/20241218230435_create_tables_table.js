exports.up = function (knex) {
  return knex.schema.createTable("tables", (table) => {
    table.increments("table_id").primary(); // Primary key
    table.string("table_name").notNullable(); // Name of the table
    table.integer("capacity").unsigned().notNullable(); // Seating capacity
    table.integer("reservation_id").unsigned().nullable(); // Foreign key for reservation
    table
      .foreign("reservation_id")
      .references("reservation_id")
      .inTable("reservations")
      .onDelete("SET NULL"); // Set reservation_id to NULL when reservation is deleted
    table.timestamps(true, true); // Automatically adds created_at and updated_at
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tables");
};
