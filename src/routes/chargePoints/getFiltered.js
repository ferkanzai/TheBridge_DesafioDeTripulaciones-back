// api/charge-points/filter?rating=3&distance=50&latitude=40.4165000&longitude=-3.7025600&connections=2&operators=8,18,11

const { getFiltered } = require("../../queries/chargePoints");

module.exports = (db) => async (req, res, next) => {
  const { latitude, longitude, distance = 30 } = req.query;
  let { rating, connections, operators } = req.query;

  const operatorsArray =
    operators.length !== 0
      ? operators.split(",").map((id) => Number(id))
      : Array.from({ length: 33 }, (_, i) => i);

  // Madrid: lat: 40.4165000 long: -3.7025600
  try {
    if (!latitude || !longitude) {
      const error = new Error(
        "Latitude and longitude parameters are mandatory"
      );
      error.code = 400;
      throw error;
    }

    if (!rating) rating = 0;
    if (!connections) connections = 0;

    const result = await getFiltered(
      db,
      latitude,
      longitude,
      distance,
      rating,
      connections,
      operatorsArray
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
