const { sql } = require("slonik");

const getFavorites = async (db, userId) => {
  try {
    return await db.query(sql`
      SELECT charge_points.*, operators.name AS operator, operators.cost
      FROM charge_points JOIN operators ON charge_points.operator_id = operators.id
      WHERE charge_points.id IN (
        SELECT charge_point_id FROM user_charge_point_favorites
        WHERE user_id = ${userId}
      );
    `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

const postAddFavorite = async (db, userId, chargePointId) => {
  try {
    return await db.query(sql`
      INSERT INTO user_charge_point_favorites (
        user_id, charge_point_id
      ) VALUES (
        ${userId}, ${chargePointId}
      ) RETURNING user_id, charge_point_id;
    `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

module.exports = {
  getFavorites,
  postAddFavorite,
};
