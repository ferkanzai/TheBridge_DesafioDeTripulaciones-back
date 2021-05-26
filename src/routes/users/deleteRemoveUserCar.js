const { deleteRemoveUserCar } = require("../../queries/users");

module.exports = (db) => async (req, res, next) => {
  const { carId } = req.params;
  const { id } = req.user;

  try {
    const result = await deleteRemoveUserCar(db, id, carId);

    if (result instanceof Error) {
      throw result;
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
