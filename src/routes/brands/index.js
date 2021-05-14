const router = require("express").Router();

module.exports = (db) => {
  router.get("/", require("./getAllBrands")(db));

  return router;
};
