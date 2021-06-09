const { getSingleChargePoint } = require("../../queries/chargePoints");

module.exports = (db) => async (req, res, next) => {
  const { chargePointId } = req.params;
  const { latitude, longitude } = req.query;

  try {
    if (!latitude || !longitude) {
      const error = new Error(
        "Latitude and longitude parameters are mandatory"
      );
      error.code = 400;
      throw error;
    }

    const result = await getSingleChargePoint(
      db,
      chargePointId,
      latitude,
      longitude
    );

    if (result instanceof Error) {
      next(result);
      return;
    }

    console.log(result);

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
