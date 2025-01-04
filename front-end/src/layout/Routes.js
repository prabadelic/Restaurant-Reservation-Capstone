import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import Search from "../dashboard/Search";
import NewReservation from "../reservations/NewReservation";
import EditReservation from "../reservations/EditReservation";
import SeatReservation from "../reservations/SeatReservation";
import NewTable from "../tables/NewTable";
import NotFound from "./NotFound";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  return (
    <Switch>
      {/* Redirect root to dashboard */}
      <Route exact path="/">
        <Redirect to="/dashboard" />
      </Route>

      {/* Dashboard with optional date query */}
      <Route exact path="/dashboard">
        <Dashboard />
      </Route>

      {/* New Reservation Page */}
      <Route exact path="/reservations/new">
        <NewReservation />
      </Route>

      {/* Edit Reservation Page */}
      <Route exact path="/reservations/:reservation_id/edit">
        <EditReservation />
      </Route>

      {/* Seat Reservation Page */}
      <Route exact path="/reservations/:reservation_id/seat">
        <SeatReservation />
      </Route>

      {/* New Table Page */}
      <Route exact path="/tables/new">
        <NewTable />
      </Route>

      {/* Search Page */}
      <Route exact={true} path="/search">
        <Search />
      </Route>

      {/* Not Found Page */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
