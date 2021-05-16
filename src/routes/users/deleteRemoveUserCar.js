const { deleteRemoveUserCar } = require("../../queries/users");

module.exports = (db) => async (req, res, next) => {
  const { carId } = req.params;
  const { id } = req.user;

  try {
    const result = await deleteRemoveUserCar(db, id, carId);

    if (!result) {
      const error = new Error("Trying to delete a row that does not exist");
      error.code = 400;
      next(error);
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user_id: id,
        car_id: Number(carId),
      },
    });
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    next(error);
  }
};
