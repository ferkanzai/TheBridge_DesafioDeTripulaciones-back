const { authenticateToken } = require("../../middlewares/authMiddlewares");

const router = require("express").Router();

module.exports = (db) => {
  router.get("/", require("./getAllBrands")(db));
  router.post("/add", authenticateToken, require("./postInsertBrand")(db));

  return router;
};
