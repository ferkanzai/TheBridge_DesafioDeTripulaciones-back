const router = require("express").Router();

module.exports = (db) => {
  router.get("/", require("./getActiveCount")(db));
  router.get("/past", require("./getPastReservations")(db));
  router.post("/start/:connectionId", require("./postStartReservation")(db));
  router.put("/cancel/:reservationId", require("./putCancelReservation")(db));
  router.post("/charge/start/:reservationId", require("./postStartCharge")(db));
  router.put("/extend/:reservationId", require("./putExtend")(db));

  return router;
};
