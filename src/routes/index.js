const router = require("express").Router();

module.exports = (db) => {
  router.use("/auth", require("./auth")(db));
  router.use("/cars", require("./cars")(db));
  router.use("/brands", require("./brands")(db));
  router.use("/test", require("./test")(db));
  router.use("/users", require("./users")(db));

  return router;
};
