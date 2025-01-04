exports.up = function (knex) {
  return knex.schema.createTable("reservations", (table) => {
    table.increments("reservation_id").primary(); // Primary key
    table.string("first_name").notNullable(); // Customer's first name
    table.string("last_name").notNullable(); // Customer's last name
    table.string("mobile_number").notNullable(); // Customer's mobile number
    table.date("reservation_date").notNullable(); // Date of reservation
    table.time("reservation_time").notNullable(); // Time of reservation
    table.integer("people").unsigned().notNullable(); // Number of people
    table.string("status").defaultTo("booked"); // Reservation status
    table.timestamps(true, true); // Automatically adds created_at and updated_at
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("reservations");
};
