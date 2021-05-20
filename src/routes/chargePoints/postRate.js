const { postRate } = require("../../queries/chargePoints");

module.exports = (db) => async (req, res, next) => {
  const { id } = req.user;
  const { chargePointId, rating } = req.params;

  try {
    const result = await postRate(db, id, chargePointId, rating);

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
