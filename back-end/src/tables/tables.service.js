const knex = require("../db/connection");

function list() {
  return knex("tables").select("*").orderBy("table_name", "asc");
}

function create(newTable) {
  return knex("tables")
    .insert(newTable)
    .returning("*")
    .then((rows) => rows[0]);
}

function read(table_id) {
  return knex("tables").where({ table_id }).first();
}

function update(table_id, reservation_id) {
  return knex("tables")
    .where({ table_id })
    .update({ reservation_id })
    .returning("*")
    .then((rows) => rows[0]);
}

function finish(table_id) {
  return knex("tables")
    .where({ table_id })
    .update({ reservation_id: null })
    .returning("*")
    .then((rows) => rows[0]);
}

module.exports = {
  list,
  create,
  read,
  update,
  finish,
};
