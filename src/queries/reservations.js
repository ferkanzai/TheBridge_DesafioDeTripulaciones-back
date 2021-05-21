const { sql } = require("slonik");

const getReservations = async (db, userId) => {
  try {
    return await db.query(sql`
      SELECT * FROM reservations
      WHERE user_id = ${userId} 
        AND is_past_reservation = false
        AND (
          expiration_date > CURRENT_TIMESTAMP at time zone 'utc'
          OR charge_end_date > CURRENT_TIMESTAMP at time zone 'utc'
        );
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
          AND (
            expiration_date < CURRENT_TIMESTAMP at time zone 'utc'
            OR charge_end_date < CURRENT_TIMESTAMP at time zone 'utc'
          );
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
        AND ( 
          expiration_date > CURRENT_TIMESTAMP at time zone 'utc' 
          OR charge_end_date > CURRENT_TIMESTAMP at time zone 'utc'
        )
        AND is_past_reservation = false;
    `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

const putStopReservationOrCharge = async (db, reservationId) => {
  try {
    return await db.query(sql`
      UPDATE reservations
        SET is_past_reservation = true
        WHERE id = ${reservationId}
        RETURNING *;
    `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

const postStartNormalCharge = async (db, userId, userCarId, reservationId) => {
  try {
    return await db.query(sql`
      WITH time_to_charge AS (
        SELECT time_to_charge
          FROM cars JOIN user_car ON user_car.car_id = cars.id,
        LATERAL charge_time(cars.range, cars.charge_speed) time_to_charge
          WHERE user_car.user_id = ${userId} AND user_car.id = ${userCarId}
      )

      UPDATE reservations
        SET charge_end_date = (CURRENT_TIMESTAMP(2) AT TIME ZONE 'UTC') + ((SELECT * FROM time_to_charge) || ' minutes')::INTERVAL
        WHERE id = ${reservationId}
          AND ( charge_end_date < CURRENT_TIMESTAMP at time zone 'utc' OR charge_end_date IS NULL)
      RETURNING *;
    `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

const postStartFastCharge = async (db, userId, userCarId, reservationId) => {
  try {
    return await db.transaction(async (tx) => {
      const isFastChargeCapable = await tx.query(sql`
        SELECT is_fast_charge FROM connections WHERE id = (
          SELECT connection_id FROM reservations WHERE id = ${reservationId}
        );
      `);

      if (!isFastChargeCapable.rows[0].is_fast_charge) {
        throw new Error("Connection has no fast charge capabilities");
      }

      await tx.query(sql`
      WITH time_to_charge AS (
        SELECT time_to_charge
          FROM cars JOIN user_car ON user_car.car_id = cars.id,
        LATERAL charge_time(cars.range, cars.fast_charge_speed) time_to_charge
          WHERE user_car.user_id = ${userId} AND user_car.id = ${userCarId}
      )

      UPDATE reservations
        SET charge_end_date = (CURRENT_TIMESTAMP(2) AT TIME ZONE 'UTC') + ((SELECT * FROM time_to_charge) || ' minutes')::INTERVAL
        WHERE id = ${reservationId}
          AND ( charge_end_date < CURRENT_TIMESTAMP at time zone 'utc' OR charge_end_date IS NULL)
      RETURNING *;
    `);
    });
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

const putExtend = async (db, reservationId) => {
  try {
    return await db.query(sql`
      UPDATE reservations
        SET expiration_date = expiration_date + '10 minutes'::INTERVAL
        WHERE id = ${reservationId}
        RETURNING *;
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
  putStopReservationOrCharge,
  postStartNormalCharge,
  postStartFastCharge,
  putExtend,
};
