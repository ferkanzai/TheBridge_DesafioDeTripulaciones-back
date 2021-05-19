const { sql } = require("slonik");

const getReservations = async (db, userId) => {
  try {
    return await db.query(sql`
      SELECT * FROM reservations
      WHERE user_id = ${userId} 
        AND is_past_reservation = false
        AND expiration_date > CURRENT_TIMESTAMP at time zone 'utc';
    `);
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    return error;
  }
};

const getPastReservations = async (db, userId) => {
  try {
    return await db.query(sql`
      SELECT * FROM reservations
      WHERE user_id = ${userId} 
        AND is_past_reservation = true;
    `);
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    return error;
  }
};

const postStartReservation = async (db, userId, connectionId) => {
  try {
    return await db.transaction(async (tx) => {
      const pastReservationId = (
        await tx.query(sql`
        SELECT id FROM reservations
        WHERE connection_id = ${connectionId} 
          AND is_past_reservation = false
          AND expiration_date < CURRENT_TIMESTAMP at time zone 'utc';
      `)
      ).rows[0]?.id;

      const newReservation = await tx.query(sql`
        INSERT INTO reservations (
          user_id, connection_id
        ) VALUES (
          ${userId}, ${connectionId}
        ) RETURNING *;
      `);

      if (pastReservationId) {
        await tx.query(sql`
          UPDATE reservations
          SET is_past_reservation = true
          WHERE id = ${pastReservationId};
        `);
      }

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
      SELECT * FROM reservations
      WHERE connection_id = ${connectionId}
        AND expiration_date > CURRENT_TIMESTAMP at time zone 'utc'
        AND is_past_reservation = false; 
    `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

module.exports = {
  getReservations,
  getPastReservations,
  postStartReservation,
  getIsConnectionReserved,
};
