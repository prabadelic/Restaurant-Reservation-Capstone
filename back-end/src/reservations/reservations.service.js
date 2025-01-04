const knex = require("../db/connection");

function list(query) {
  const { date, mobile_number } = query;

  if (mobile_number) {
    return knex("reservations")
      .whereRaw(
        "translate(mobile_number, '() -', '') like ?",
        `%${mobile_number.replace(/\D/g, "")}%`
      )
      .orderBy("reservation_date", "asc");
  }

  if (date) {
    return knex("reservations")
      .select("*")
      .where({ reservation_date: date })
      .andWhereNot({ status: "finished" })
      .orderBy("reservation_time", "asc");
  }

  return knex("reservations").select("*").orderBy("reservation_date", "asc");
}

function create(newReservation) {
  return knex("reservations")
    .insert(newReservation)
    .returning("*")
    .then((rows) => rows[0]);
}

function read(reservation_id) {
  return knex("reservations").where({ reservation_id }).first();
}

function update(reservation_id, updatedFields) {
  return knex("reservations")
    .where({ reservation_id })
    .update(updatedFields, "*")
    .then((rows) => rows[0]);
}

function updateStatus(reservation_id, status) {
  return knex("reservations")
    .where({ reservation_id })
    .update({ status })
    .returning("*")
    .then((rows) => rows[0]);
}

module.exports = {
  list,
  create,
  read,
  update,
  updateStatus,
};
