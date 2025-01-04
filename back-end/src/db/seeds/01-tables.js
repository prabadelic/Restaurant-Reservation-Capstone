const tablesData = require("./01-tables.json");

exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("tables")
    .del()
    .then(() => {
      // Inserts seed entries
      return knex("tables").insert(tablesData);
    });
};
