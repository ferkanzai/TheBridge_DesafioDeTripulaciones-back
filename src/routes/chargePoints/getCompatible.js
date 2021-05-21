const { getCompatible } = require("../../queries/chargePoints");

module.exports = (db) => async (req, res, next) => {
  const { carIds } = req.query;

  const carsArray = carIds?.split(",").map((id) => Number(id));

  try {
    if (!carsArray) {
      const error = new Error("At least one car is necessary");
      error.code = 400;
      throw error;
    }
    const result = await getCompatible(db, carsArray);

    if (!result) {
      const error = new Error("Error");
      error.code = 400;
      throw error;
    }

    const { rows, rowCount } = result;

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    next(error);
  }
};
