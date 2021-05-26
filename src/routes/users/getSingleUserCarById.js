const { getSingleUserCarById } = require("../../queries/users");

module.exports = (db) => async (req, res, next) => {
  const { id } = req.user;
  const { userCarId } = req.params;

  try {
    const result = await getSingleUserCarById(db, id, userCarId);

    const { rows, rowCount } = result;

    if (!rowCount) {
      const error = new Error("Unabel to find this car");
      error.code = 404;
      throw error;
    }

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
