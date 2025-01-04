import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import {
  getReservationBySeat,
  listTables,
  setTableReservation,
} from "../utils/api";

function SeatReservation() {
  const { reservation_id } = useParams();
  const history = useHistory();

  // State management
  const [reservation, setReservation] = useState({});
  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState(null);

  const [tablesError, setTablesError] = useState(null);
  const [reservationError, setReservationError] = useState(null);
  const [selectionError, setSelectionError] = useState(null);
  const [commonError, setCommonError] = useState(null);

  /**
   * Fetch reservation and tables data on load
   */
  useEffect(() => {
    const abortController = new AbortController();

    const fetchReservationAndTables = async () => {
      try {
        setReservationError(null);
        const reservationData = await getReservationBySeat(
          reservation_id,
          abortController.signal
        );
        setReservation(reservationData);

        const tablesData = await listTables(abortController.signal);
        setTables(tablesData);
      } catch (error) {
        if (error.name !== "AbortError") {
          setReservationError(error.message);
          setTablesError(error.message);
        }
      }
    };

    fetchReservationAndTables();

    return () => abortController.abort();
  }, [reservation_id]);

  /**
   * Format Date for Display
   */
  function formatDate(dateString) {
    if (!dateString) return "Invalid Date";

    const date = new Date(dateString);
    if (isNaN(date)) return "Invalid Date";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /**
   * Handle Table Selection Change
   */
  const handleChange = ({ target }) => {
    setSelectionError(null);
    setTablesError(null);
    setReservationError(null);

    const selectedTableId = target.value;
    if (selectedTableId === "select") {
      return setSelectionError("Please select a table");
    }

    const currentTable = tables.find(
      (table) => Number(table.table_id) === Number(selectedTableId)
    );

    console.log("[SeatRes] Selected Table:", currentTable);

    if (!currentTable) {
      return setTablesError("Selected table not found.");
    }

    const capacity =
      target.options[target.selectedIndex].getAttribute("data-capacity");

    if (currentTable.reservation_id != null) {
      return setTablesError("This table is already occupied.");
    }

    if (reservation.people > capacity) {
      return setTablesError(
        "Reservation capacity is greater than table capacity."
      );
    }

    setSelectedTableId(selectedTableId);
  };

  /**
   * Handle Form Submission
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedTableId || selectedTableId === "select") {
      return setSelectionError("Please select a table");
    }

    const selectedTable = tables.find(
      (table) => Number(table.table_id) === Number(selectedTableId)
    );

    if (!selectedTable) {
      setTablesError("Invalid table selected.");
      return;
    }

    if (selectedTable.reservation_id) {
      setTablesError("This table is already occupied.");
      return;
    }

    if (reservation.people > selectedTable.capacity) {
      setTablesError(
        `Table capacity (${selectedTable.capacity}) is less than reservation size (${reservation.people}).`
      );
      return;
    }

    try {
      console.log(
        `[SeatRes] Submitting Reservation ID: ${reservation.reservation_id}`
      );
      console.log(`[SeatRes] Selected Table ID: ${selectedTableId}`);
      await setTableReservation(selectedTableId, reservation.reservation_id);
      history.push(`/dashboard?date=${reservation.reservation_date}`);
    } catch (error) {
      console.error("[SeatRes] Error seating reservation:", error.message);
      setCommonError(error.message || "Failed to seat reservation.");
    }
  };

  /**
   * Render Table Options
   */
  const tableOptions =
    tables.length > 0
      ? tables.map((table) => (
          <option
            key={table.table_id}
            value={table.table_id}
            data-capacity={table.capacity}
          >
            {table.table_name} - {table.capacity}
          </option>
        ))
      : [];

  return (
    <main>
      <h4 className="mt-2 date-title">Select Table</h4>
      <div
        key={reservation.reservation_id}
        className="shadow-sm list-group-item"
      >
        <div className="d-flex row justify-content-between align-items reservation-cards">
          <div className="col-9">
            <h5>
              {reservation.first_name} {reservation.last_name}
            </h5>
            <div className="mt-1 font-weight-bold">
              {reservation.reservation_time}
            </div>
            <div>
              {reservation.people}{" "}
              {reservation.people > 1 ? "people" : "person"}
            </div>
            <div className="fs-5">
              {formatDate(reservation.reservation_date)}
            </div>
            <div className="font-italic">{reservation.mobile_number}</div>
          </div>
          <div className="d-flex col-3 flex-column id">
            <div>ID: {reservation.reservation_id}</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <select
          name="table_id"
          value={selectedTableId || ""}
          onChange={handleChange}
          className="my-3"
        >
          <option value="select">-- Select an Option --</option>
          {tableOptions}
        </select>

        <div className="buttons d-flex justify-content-between">
          <button
            className="btn btn-outline-dark w-100"
            type="button"
            onClick={() => history.goBack()}
          >
            Cancel
          </button>
          <button className="btn submit-button w-100 ml-2" type="submit">
            Submit
          </button>
        </div>
      </form>

      {/* Error Messages */}
      {reservationError && (
        <div className="mt-3 alert alert-danger">
          Reservation Error: {reservationError}
        </div>
      )}
      {tablesError && (
        <div className="mt-3 alert alert-danger">
          Table Error: {tablesError}
        </div>
      )}
      {selectionError && (
        <div className="mt-3 alert alert-danger">
          Selection Error: {selectionError}
        </div>
      )}
      {commonError && (
        <div className="mt-3 alert alert-danger">Error: {commonError}</div>
      )}
      <ErrorAlert error={commonError} />
    </main>
  );
}

export default SeatReservation;
