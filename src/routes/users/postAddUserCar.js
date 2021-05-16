const { postAddUserCar } = require("../../queries/users");

module.exports = (db) => async (req, res, next) => {
  const { id } = req.user;
  const { carId } = req.body;

  try {
    if (!carId) {
      const error = new Error("Missing car_id parameter");
      error.code = 400;
      throw error;
    }

    const result = await postAddUserCar(db, id, carId);

    if (result instanceof Error) {
      next(result);
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user_id: id,
        car_id: carId,
      },
    });
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    next(error);
  }
};
