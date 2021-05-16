const router = require("express").Router();

module.exports = (db) => {
  router.get("/", require("./activeCount")(db));

  return router;
};
