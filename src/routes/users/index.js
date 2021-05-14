const router = require("express").Router();

module.exports = (db) => {
  router.get("/", require("./getUserById")(db));

  return router;
};
