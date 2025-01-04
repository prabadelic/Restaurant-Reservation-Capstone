const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const service = require("./tables.service");
const reservationsService = require("../reservations/reservations.service");

function hasRequiredFields(req, res, next) {
  const { data = {} } = req.body;
  const requiredFields = ["table_name", "capacity"];

  for (const field of requiredFields) {
    if (!data[field]) {
      return next({ status: 400, message: `Field '${field}' is missing.` });
    }
  }

  if (data.capacity < 1 || typeof data.capacity !== "number") {
    return next({
      status: 400,
      message: "'capacity' must be a number greater than 0.",
    });
  }

  if (data.table_name.length < 2) {
    return next({
      status: 400,
      message: "'table_name' must be at least 2 characters long.",
    });
  }

  next();
}

async function seatReservation(req, res, next) {
  console.log("seatReservation request to /tables");
  const { table_id } = req.params;
  const { data } = req.body;

  // Validate if `data` exists
  if (!data || !data.reservation_id) {
    return next({
      status: 400,
      message: "reservation_id is required.",
    });
  }

  const { reservation_id } = data;

  const table = await service.read(table_id);
  if (!table) {
    return next({
      status: 404,
      message: `Table with ID ${table_id} not found.`,
    });
  }

  const reservation = await reservationsService.read(reservation_id);
  if (!reservation) {
    return next({
      status: 404,
      message: `Reservation with ID ${reservation_id} not found.`,
    });
  }

  // Validate reservation status
  if (reservation.status === "seated") {
    return next({
      status: 400,
      message: "Reservation is already seated.",
    });
  }

  // Validate table capacity
  if (table.capacity < reservation.people) {
    return next({
      status: 400,
      message: `Table capacity (${table.capacity}) is insufficient for reservation party size (${reservation.people}).`,
    });
  }

  // Check if table is already occupied
  if (table.reservation_id) {
    return next({
      status: 400,
      message: "Table is currently occupied.",
    });
  }

  // Seat the reservation
  await service.update(table_id, reservation_id);
  await reservationsService.updateStatus(reservation_id, "seated");

  res.status(200).json({ data: { status: "seated" } });
}

async function list(req, res) {
  console.log("List request to /tables");
  const data = await service.list();
  res.json({ data });
}

async function create(req, res) {
  console.log("Create request to /tables");
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

async function finishReservation(req, res, next) {
  console.log("finishReservation request to /tables");
  const { table_id } = req.params;

  const table = await service.read(table_id);
  if (!table) {
    return next({
      status: 404,
      message: `Table with ID ${table_id} not found.`,
    });
  }

  if (!table.reservation_id) {
    return next({ status: 400, message: "Table is not occupied." });
  }

  await reservationsService.updateStatus(table.reservation_id, "finished");
  await service.finish(table_id);

  res.status(200).json({ data: { status: "finished" } });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [hasRequiredFields, asyncErrorBoundary(create)],
  seatReservation: asyncErrorBoundary(seatReservation),
  finishReservation: asyncErrorBoundary(finishReservation),
};
