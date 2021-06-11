const { getFiltered } = require("../../queries/chargePoints");

module.exports = (db) => async (req, res, next) => {
  const {} = req.query;
  let {
    latitude,
    longitude,
    distance = 30,
    rating,
    connections,
    operators,
    connectionTypes,
  } = req.query;

  // Madrid: lat: 40.4165000 long: -3.7025600
  try {
    if (!latitude || !longitude) {
      const error = new Error(
        "Latitude and longitude parameters are mandatory"
      );
      error.code = 400;
      throw error;
    }

    rating = rating === undefined ? Number(rating) : 0;
    connections = connections === "null" ? 0 : Number(connections);
    latitude = Number(latitude);
    longitude = Number(longitude);
    distance = Number(distance);

    const operatorsArray =
      operators === "false" || operators.length === 0
        ? Array.from({ length: 33 }, (_, i) => i + 1)
        : operators.split(",").map((id) => Number(id));

    const connectionsArray =
      connectionTypes === "" || connectionTypes === "false"
        ? ["%%"]
        : connectionTypes?.split(",").map((c) => c);

    const result = await getFiltered(
      db,
      latitude,
      longitude,
      distance,
      rating,
      connections,
      operatorsArray,
      connectionsArray
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
