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

const postRate = async (db, userId, chargePointId, rating) => {
  try {
    return await db.transaction(async (tx) => {
      const userRate = await tx.query(sql`
        INSERT INTO user_rating (
          user_id, charge_point_id, rating
        ) VALUES (
          ${userId}, ${chargePointId}, ${rating}
        ) RETURNING *;
      `);

      await tx.query(sql`
        UPDATE charge_points
        SET votes = votes + 1, rating = ((rating * votes) + ${rating}) / (votes + 1)
        WHERE id = ${chargePointId};
      `);

      return userRate;
    });
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

module.exports = {
  getAllChargePoints,
  getChargePointsByDistance,
  postRate,
};
