const { getAllChargePoints } = require("../../queries/chargePoints");

module.exports = (db) => async (req, res, next) => {
  try {
    const result = await getAllChargePoints(db);

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
  }
};
