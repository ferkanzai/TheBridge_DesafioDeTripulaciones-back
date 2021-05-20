const router = require("express").Router();

module.exports = (db) => {
  router.get("/profile", require("./getProfile")(db));
  router.get("/cars", require("./getUserCars")(db));
  router.post("/add-car/:carId", require("./postAddUserCar")(db));
  router.put(
    "/car/change-alias/:userCarId",
    require("./putUpdateCarAlias")(db)
  );
  router.delete("/remove-car/:carId", require("./deleteRemoveUserCar")(db));

  return router;
};
