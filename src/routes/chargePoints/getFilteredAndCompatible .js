const { getFilteredAndCompatible } = require("../../queries/chargePoints");

module.exports = (db) => async (req, res, next) => {
  const { carIds } = req.query;
  let {
    latitude,
    longitude,
    distance = 30,
    rating,
    connections,
    operators,
  } = req.query;

  const carsArray = carIds?.split(",").map((id) => Number(id));

  // Madrid: lat: 40.4165000 long: -3.7025600
  try {
    if (!latitude || !longitude) {
      const error = new Error(
        "Latitude and longitude parameters are mandatory"
      );
      error.code = 400;
      throw error;
    }

    if (!carsArray) {
      const error = new Error("At least one car is necessary");
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

    const result = await getFilteredAndCompatible(
      db,
      latitude,
      longitude,
      distance,
      rating,
      connections,
      operatorsArray,
      carsArray
    );

    if (!result) {
      const error = new Error("Error");
      error.code = 400;
      throw error;
    }

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
