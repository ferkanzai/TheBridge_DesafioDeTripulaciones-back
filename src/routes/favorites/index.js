const router = require("express").Router();

module.exports = (db) => {
  router.get("/", require("./getFavorites")(db));
  router.post("/add/:chargePointId", require("./postAddFavorite")(db));

  return router;
};
