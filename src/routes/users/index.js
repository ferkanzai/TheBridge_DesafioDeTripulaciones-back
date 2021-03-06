const router = require("express").Router();

module.exports = (db) => {
  router.get("/profile", require("./getProfile")(db));
  router.get("/cars", require("./getUserCars")(db));
  router.get("/car/:userCarId", require("./getSingleUserCarById")(db));
  router.post("/add-car/:carId", require("./postAddUserCar")(db));
  router.put(
    "/car/change-alias/:userCarId",
    require("./putUpdateCarAlias")(db)
  );
  router.put(
    "/car/change-primary/:userCarId",
    require("./putChangeUserCarPrimary")(db)
  );
  router.delete("/remove-car/:carId", require("./deleteRemoveUserCar")(db));

  return router;
};
