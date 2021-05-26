const { getChargePointsByDistance } = require("../../queries/chargePoints");

module.exports = (db) => async (req, res, next) => {
  const { latitude, longitude, distance = 30 } = req.query;

  // Madrid: lat: 40.4165000 long: -3.7025600
  try {
    if (!latitude || !longitude) {
      const error = new Error(
        "Latitude and longitude parameters are mandatory"
      );
      error.code = 400;
      throw error;
    }

    const result = await getChargePointsByDistance(
      db,
      latitude,
      longitude,
      distance
    );

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
