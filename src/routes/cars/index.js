const router = require("express").Router();

module.exports = (db) => {
  router.get("/:brand/available", require("./getAvailableCarsByBrand")(db));
  router.get("/:brand", require("./getCarsByBrand")(db));

  return router;
};
