const { getConnectionsByChargePoint } = require("../../queries/connections");

module.exports = (db) => async (req, res, next) => {
  const { chargePointId } = req.params;

  try {
    const result = await getConnectionsByChargePoint(db, chargePointId);

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
