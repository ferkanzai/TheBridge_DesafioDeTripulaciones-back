const router = require("express").Router();

module.exports = (db) => {
  router.get("/all", require("./getAll")(db));
  // router.get("/:distance", require("./getFromDistance")(db));

  return router;
};
