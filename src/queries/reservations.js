const { sql } = require("slonik");

const getReservations = async (db, userId) => {
  try {
    return await db.query(sql`
      SELECT * FROM reservations
      WHERE user_id = ${userId};
    `);
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    return error;
  }
};

const postStartReservation = async (db, userId, connectionId) => {
  try {
    return await db.transaction(async (tx) => {
      const newReservation = await tx.query(sql`
        INSERT INTO reservations (
          user_id, connection_id
        ) VALUES (
          ${userId}, ${connectionId}
        ) RETURNING *;
      `);

      await tx.query(sql`
        DELETE FROM reservations
        WHERE connection_id = ${connectionId} AND user_id <> ${userId};
      `);

      return newReservation;
    });
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

const getIsConnectionReserved = async (db, connectionId) => {
  try {
    return await db.query(sql`
      SELECT * FROM reservations WHERE connection_id = ${connectionId}; 
    `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

module.exports = {
  getReservations,
  postStartReservation,
  getIsConnectionReserved,
};
