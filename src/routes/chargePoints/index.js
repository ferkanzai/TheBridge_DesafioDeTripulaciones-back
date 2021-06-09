const { authenticateToken } = require("../../middlewares/authMiddlewares");

const router = require("express").Router();

module.exports = (db) => {
  router.get("/", require("./getFromDistance")(db));
  router.get("/single/:chargePointId", require("./getSingleChargePoint")(db));
  router.get("/all", require("./getAll")(db));
  router.post(
    "/:chargePointId/rate/:rating",
    authenticateToken,
    require("./postRate")(db)
  );
  router.get("/compatible", authenticateToken, require("./getCompatible")(db));
  router.get(
    "/compatible/distance",
    authenticateToken,
    require("./getCompatibleFromDistance")(db)
  );
  router.get("/filter", require("./getFiltered")(db));
  router.get(
    "/filter-and-compatible",
    authenticateToken,
    require("./getFiltered")(db)
  );

  return router;
};
