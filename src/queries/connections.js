const { sql } = require("slonik");

const getConnectionsByChargePoint = async (db, chargePointId) => {
  try {
    return await db.query(sql`
      SELECT * FROM connections
      WHERE charge_point_id = ${chargePointId};
    `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    next(error);
  }
};

module.exports = {
  getConnectionsByChargePoint,
};
