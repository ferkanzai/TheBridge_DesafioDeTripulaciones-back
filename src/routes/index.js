const { authenticateToken } = require("../middlewares/authMiddlewares");

const router = require("express").Router();

module.exports = (db) => {
  router.use("/auth", require("./auth")(db));
  router.use("/brands", require("./brands")(db));
  router.use("/cars", require("./cars")(db));
  router.use("/favorites", authenticateToken, require("./favorites")(db));
  router.use("/test", require("./test")(db));
  router.use("/users", authenticateToken, require("./users")(db));

  return router;
};
