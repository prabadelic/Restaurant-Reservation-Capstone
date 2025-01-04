import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function NewTable() {
  const history = useHistory();
  const [table_name, setTableName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [error, setError] = useState(null);

  // Handle Form Submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(`[newTable] Submitting form - Table Name: ${table_name} Capacity: ${capacity}`);
    const abortController = new AbortController();

    // Table name validation (allowing '#' as a valid character)
    if (!table_name || table_name.trim().length < 2) {
      console.warn(
        "[newTable]⚠️ Table Name validation failed: Must be at least 2 characters long."
      );
      setError("Table name must be at least 2 characters long.");
      return;
    }

    if (!capacity || capacity <= 0) {
      console.warn("[newTable]⚠️ Capacity validation failed.");
      setError("Capacity must be at least 1.");
      return;
    }

    const newTable = {
      table_name,
      capacity: Number(capacity),
    };

    try {
      console.log("[newTable]API request to create table:", newTable);
      const response = await createTable(newTable, abortController.signal);
      console.log("[newTable] Table created successfully:", response);
      history.push(`/dashboard`);
    } catch (err) {
      console.error("[newTable] ❌ Error creating table:", err.message);
      setError(err.message);
    }

    return () => abortController.abort();
  };

  return (
    <main>
      <h1>Create New Table</h1>
      <ErrorAlert error={error} />
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="table_name">Table Name:</label>
          <input
            id="table_name"
            name="table_name"
            type="text"
            value={table_name}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="Enter Table Name"
            required
            minLength={2}
          />
        </div>
        <div>
          <label htmlFor="capacity">Capacity:</label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="Enter Capacity"
            required
            min={1}
          />
        </div>
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
      <ErrorAlert error={error} />
      {error && <div className="alert alert-danger mt-2">{error}</div>}
    </main>
  );
}

export default NewTable;
