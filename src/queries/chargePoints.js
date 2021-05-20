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

module.exports = {
  getAllChargePoints,
};
