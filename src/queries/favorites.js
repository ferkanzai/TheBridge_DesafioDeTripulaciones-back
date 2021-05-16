const { sql } = require("slonik");

const getFavorites = async (db, userId) => {
  try {
    return await db.query(sql`
      SELECT charge_points.*, operators.name, operators.cost
      FROM charge_points JOIN operators ON charge_points.operator_id = operators.id
      WHERE charge_points.id IN (
        SELECT id FROM user_charge_point_favorites
        WHERE user_id = ${userId}
      )
    `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

module.exports = {
  getFavorites,
};
