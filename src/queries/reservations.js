const { sql } = require("slonik");

const getReservations = async (db) => {
  try {
    return await db.query(sql`
      SELECT * FROM reservations;
    `);
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    return error;
  }
};

module.exports = {
  getReservations,
};
