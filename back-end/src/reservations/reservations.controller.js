const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const service = require("./reservations.service");

function hasRequiredFields(req, res, next) {
  const { data = {} } = req.body;
  const requiredFields = [
    "first_name",
    "last_name",
    "mobile_number",
    "reservation_date",
    "reservation_time",
    "people",
  ];

  for (const field of requiredFields) {
    if (!data[field]) {
      return next({ status: 400, message: `Field '${field}' is missing.` });
    }
  }
  next();
}

function validateFields(req, res, next) {
  const { data: { reservation_date, reservation_time, people } = {} } =
    req.body;

  if (isNaN(Date.parse(reservation_date))) {
    return next({
      status: 400,
      message: "'reservation_date' must be a valid date.",
    });
  }

  if (!/^\d{2}:\d{2}$/.test(reservation_time)) {
    return next({
      status: 400,
      message: "'reservation_time' must be a valid time.",
    });
  }

  if (typeof people !== "number" || people < 1) {
    return next({
      status: 400,
      message: "'people' must be a number greater than 0.",
    });
  }
  next();
}

async function validateDate(req, res, next) {
  const { reservation_date, reservation_time } = req.body.data;

  const dateTimeString = `${reservation_date}T${reservation_time}`;
  const reservationDateTime = new Date(dateTimeString);
  const today = new Date().toISOString().split("T")[0];

  if (reservation_date < today) {
    return next({
      status: 400,
      message: "Reservation must be for a future date.",
    });
  }

  if (reservationDateTime.getDay() === 2) {
    return next({
      status: 400,
      message: "The restaurant is closed on Tuesdays.",
    });
  }

  next();
}

async function validateTime(req, res, next) {
  const { reservation_time } = req.body.data;

  if (reservation_time < "10:30" || reservation_time > "21:30") {
    return next({
      status: 400,
      message: "Reservation time must be between 10:30 AM and 9:30 PM.",
    });
  }

  next();
}

async function create(req, res, next) {
  console.log("Create request to /reservations");
  const { status } = req.body.data;

  if (status && status !== "booked") {
    return next({
      status: 400,
      message: status,
    });
  }

  const data = await service.create({ ...req.body.data, status: "booked" });
  res.status(201).json({ data });
}

async function read(req, res, next) {
  console.log("Read request to /reservations");
  const { reservation_id } = req.params;
  const reservation = await service.read(reservation_id);

  if (!reservation) {
    return next({
      status: 404,
      message: `Reservation with ID ${reservation_id} not found.`,
    });
  }

  res.json({ data: reservation });
}

const validStatuses = ["booked", "seated", "finished", "cancelled"];

function validateStatus(req, res, next) {
  const { status } = req.body.data || {};

  if (!status || !validStatuses.includes(status)) {
    return next({
      status: 400,
      message: `unknown`,
    });
  }

  if (req.method === "POST" && ["seated", "finished"].includes(status)) {
    return next({
      status: 400,
      message: `New reservations cannot have a status of '${status}'.`,
    });
  }

  next();
}

async function updateStatus(req, res, next) {
  console.log("updateStatus request to /reservations");
  const { reservation_id } = req.params;
  const { status } = req.body.data;

  const validStatuses = ["booked", "seated", "finished", "cancelled"];
  if (!validStatuses.includes(status)) {
    return next({
      status: 400,
      message: `Status must be one of: ${validStatuses.join(", ")}.`,
    });
  }

  const reservation = await service.read(reservation_id);
  if (!reservation) {
    return next({
      status: 404,
      message: `Reservation ${reservation_id} not found.`,
    });
  }

  if (reservation.status === "finished") {
    return next({
      status: 400,
      message: "A finished reservation cannot be updated.",
    });
  }

  // Update status
  const updatedReservation = await service.updateStatus(reservation_id, status);

  if (!updatedReservation) {
    return next({
      status: 500,
      message: "Failed to update reservation status.",
    });
  }

  res.status(200).json({ data: updatedReservation });
}

//Ensure seated status after seating
async function seatReservation(req, res, next) {
  console.log("seatReservation request to /reservations");
  const { reservation_id } = req.body.data;

  const reservation = await service.read(reservation_id);

  if (!reservation) {
    return next({
      status: 404,
      message: `Reservation with ID ${reservation_id} not found.`,
    });
  }

  if (reservation.status === "seated") {
    return next({
      status: 400,
      message: "This reservation is already seated.",
    });
  }

  await service.updateStatus(reservation_id, "seated");
  res.json({ data: { status: "seated" } });
}

async function list(req, res) {
  console.log("List request to /reservations");
  const { date, mobile_number } = req.query;
  const data = await service.list({ date, mobile_number });
  res.json({ data });
}

function validateReservationData(req, res, next) {
  const { data = {} } = req.body;

  const requiredFields = [
    "first_name",
    "last_name",
    "mobile_number",
    "reservation_date",
    "reservation_time",
    "people",
  ];

  for (const field of requiredFields) {
    if (!data[field] || data[field] === "") {
      return next({
        status: 400,
        message: `Field '${field}' is required and cannot be empty.`,
      });
    }
  }

  if (isNaN(Date.parse(data.reservation_date))) {
    return next({
      status: 400,
      message: "'reservation_date' must be a valid date.",
    });
  }

  if (!/^\d{2}:\d{2}$/.test(data.reservation_time)) {
    return next({
      status: 400,
      message: "'reservation_time' must be a valid time format (HH:MM).",
    });
  }

  if (typeof data.people !== "number" || data.people < 1) {
    return next({
      status: 400,
      message: "'people' must be a number greater than 0.",
    });
  }

  next();
}

async function update(req, res, next) {
  console.log("Update request to /reservations");
  const { reservation_id } = req.params;
  const { data = {} } = req.body;

  // Validate required fields
  const requiredFields = [
    "first_name",
    "last_name",
    "mobile_number",
    "reservation_date",
    "reservation_time",
    "people",
  ];

  for (const field of requiredFields) {
    if (!data[field] || data[field] === "") {
      return next({
        status: 400,
        message: `Field '${field}' is missing or empty.`,
      });
    }
  }

  if (typeof data.people !== "number" || data.people < 1) {
    return next({
      status: 400,
      message: "'people' must be a number greater than 0.",
    });
  }

  const reservation = await service.read(reservation_id);
  if (!reservation) {
    return next({
      status: 404,
      message: `Reservation with ID ${reservation_id} not found.`,
    });
  }

  const updatedReservation = await service.update(reservation_id, data);
  res.status(200).json({ data: updatedReservation });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    asyncErrorBoundary(hasRequiredFields),
    asyncErrorBoundary(validateFields),
    asyncErrorBoundary(validateDate),
    asyncErrorBoundary(validateTime),
    asyncErrorBoundary(create),
  ],
  read: asyncErrorBoundary(read),
  update: [validateReservationData, asyncErrorBoundary(update)],
  updateStatus: [
    asyncErrorBoundary(validateStatus),
    asyncErrorBoundary(updateStatus),
  ],
  seatReservation: asyncErrorBoundary(seatReservation),
};
