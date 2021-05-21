const { authenticateToken } = require("../../middlewares/authMiddlewares");

const router = require("express").Router();

module.exports = (db) => {
  router.get("/", require("./getFromDistance")(db));
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

  return router;
};
