const router = require("express").Router();

module.exports = (db) => {
  router.get("/", require("./getActiveCount")(db));
  router.get("/past", require("./getPastReservations")(db));
  router.post("/start/:connectionId", require("./postStartReservation")(db));

  return router;
};
