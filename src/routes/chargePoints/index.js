const router = require("express").Router();

module.exports = (db) => {
  router.get("/", require("./getFromDistance")(db));
  router.get("/all", require("./getAll")(db));

  return router;
};
