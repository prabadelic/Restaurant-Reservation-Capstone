const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const express = require("express");
const cors = require("cors");

const errorHandler = require("./errors/errorHandler");
const notFound = require("./errors/notFound");
const reservationsRouter = require("./reservations/reservations.router");
const tablesRouter = require("./tables/tables.router");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/reservations", reservationsRouter);
app.use("/tables", tablesRouter);

// Serve static files from the frontend build folder
app.use(express.static(path.join(__dirname, "..", "front-end", "build")));

// Handle React frontend routing for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "front-end", "build", "index.html"));
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
