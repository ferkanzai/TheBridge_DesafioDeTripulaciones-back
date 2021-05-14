const router = require("express").Router();

module.exports = (db) => {
  router.post("/signup", require("./postSignUp")(db));
  router.post("/login", require("./postSignIn")(db));
  // router.get("/logout", require("./logOut")(db));

  return router;
};
