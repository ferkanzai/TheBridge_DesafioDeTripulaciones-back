const { sql } = require("slonik");

const getFavorites = async (db, userId) => {
  try {
    return await db.query(sql`
      SELECT favs.id AS fav_id, charge_points.*, operators.name AS operator, operators.cost
      FROM charge_points JOIN operators ON charge_points.operator_id = operators.id
      JOIN user_charge_point_favorites favs ON favs.charge_point_id = charge_points.id
      WHERE user_id = ${userId};
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

const deleteRemoveFavorite = async (db, favoriteId) => {
  try {
    return await db.query(sql`
      DELETE FROM user_charge_point_favorites
      WHERE id = ${favoriteId};
    `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

module.exports = {
  getFavorites,
  postAddFavorite,
  deleteRemoveFavorite,
};
