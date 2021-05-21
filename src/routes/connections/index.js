const router = require("express").Router();

module.exports = (db) => {
  router.get("/:chargePointId", require("./getConnectionsByChargePointId")(db));

  return router;
};
