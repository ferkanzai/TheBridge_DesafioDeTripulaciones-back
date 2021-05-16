const router = require("express").Router();

module.exports = (db) => {
  router.get("/", require("./getActiveCount")(db));

  return router;
};
