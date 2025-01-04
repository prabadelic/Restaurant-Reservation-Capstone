import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReservationForm from "./ReservationForm";
import { readReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { formatAsDate, formatAsTime } from "../utils/date-time";

function EditReservations() {
  const { reservation_id } = useParams();
  const [initialFormState, setInitialFormState] = useState(null);
  const [error, setError] = useState(null);

  // Fetch the reservation
  useEffect(() => {
    const abortController = new AbortController();

    async function fetchReservation() {
      try {
        const reservation = await readReservation(
          reservation_id,
          abortController.signal
        );
        // Format the date and time correctly
        reservation.reservation_date = formatAsDate(
          reservation.reservation_date
        );
        reservation.reservation_time = formatAsTime(
          reservation.reservation_time
        );
        setInitialFormState(reservation);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("[EditRes] Error fetching reservation:", err);
          setError(err.message || "Failed to fetch reservation details.");
        }
      }
    }

    fetchReservation();
    return () => abortController.abort();
  }, [reservation_id]);

  if (error) {
    return <ErrorAlert error={error} />;
  }

  if (!initialFormState) {
    return (
      <div className="loading-spinner">Loading reservation details...</div>
    );
  }

  return (
    <main className="helvetica">
      <h3 className="date-title m-3 form-title">Edit Reservation</h3>
      <ReservationForm initialFormState={initialFormState} status="edit" />
    </main>
  );
}

export default EditReservations;
