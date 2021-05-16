const { authenticateToken } = require("../../middlewares/authMiddlewares");

const router = require("express").Router();

module.exports = (db) => {
  router.get("/profile", authenticateToken, require("./getProfile")(db));
  router.get("/cars", authenticateToken, require("./getUserCars")(db));
  router.post("/add-car", authenticateToken, require("./postAddUserCar")(db));
  router.delete(
    "/remove-car/:userCarId",
    authenticateToken,
    require("./deleteRemoveUserCar")(db)
  );

  return router;
};
