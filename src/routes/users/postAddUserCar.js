const { postAddUserCar } = require("../../queries/users");

module.exports = (db) => async (req, res, next) => {
  const { id } = req.user;
  const { carId } = req.params;

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

    const { rows, rowCount } = result;

    res.status(200).json({
      success: true,
      count: rowCount,
      data: rows,
    });
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    next(error);
  }
};
