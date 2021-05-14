const { authenticateToken } = require("../../middlewares/authMiddlewares");

const router = require("express").Router();

module.exports = (db) => {
  router.get("/", authenticateToken, require("./test")(db));
  router.get("/reservations", require("./reservations")(db));

  return router;
};
