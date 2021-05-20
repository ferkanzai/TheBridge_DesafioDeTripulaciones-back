const { sql } = require("slonik");

const getAllChargePoints = async (db) => {
  try {
    return await db.query(sql`
      SELECT * FROM charge_points;
    `);
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    return error;
  }
};

const getChargePointsByDistance = async (db, latitude, longitude, distance) => {
  try {
    return await db.query(sql`
      SELECT cp.*, distance.*
      FROM charge_points cp,
          LATERAL distance(cp.latitude, cp.longitude, ${latitude}, ${longitude}) distance
      WHERE distance < ${distance}
    `);
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    return error;
  }
};

module.exports = {
  getAllChargePoints,
  getChargePointsByDistance,
};
