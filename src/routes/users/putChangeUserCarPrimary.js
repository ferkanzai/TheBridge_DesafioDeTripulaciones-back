const { putChangeUserCarPrimary } = require("../../queries/users");

module.exports = (db) => async (req, res, next) => {
  const { userCarId } = req.params;
  const { id } = req.user;

  console.log(userCarId);

  try {
    const result = await putChangeUserCarPrimary(db, id, userCarId);

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
