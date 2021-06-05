const { authenticateToken } = require("../../middlewares/authMiddlewares");

const router = require("express").Router();

module.exports = (db) => {
  router.post("/signup", require("./postSignUp")(db));
  router.post("/login", require("./postSignIn")(db));
  router.get("/profile", authenticateToken, require("./getProfile")(db));
  router.get(
    "/profile/full",
    authenticateToken,
    require("./getFullProfile")(db)
  );
  // router.get("/logout", require("./logOut")(db));

  return router;
};
