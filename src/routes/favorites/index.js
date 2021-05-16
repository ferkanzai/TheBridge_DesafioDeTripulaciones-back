const { authenticateToken } = require("../../middlewares/authMiddlewares");

const router = require("express").Router();

module.exports = (db) => {
  router.get("/", authenticateToken, require("./getFavorites")(db));

  return router;
};
