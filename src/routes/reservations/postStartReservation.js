const {
  getReservations,
  getIsConnectionReserved,
  postStartReservation,
} = require("../../queries/reservations");

module.exports = (db) => async (req, res, next) => {
  const { id } = req.user;
  const { connectionId } = req.params;

  try {
    const reservationCount = await getReservations(db, id);

    if (reservationCount.rowCount) {
      const error = new Error(
        "Unable to create new reservation, user has an active reservation in place"
      );
      error.code = 403;
      throw error;
    }

    const isConnectionReserved = await getIsConnectionReserved(
      db,
      connectionId
    );

    const now = new Date(Date.now()).toUTCString();
    const expiration_date = new Date(
      isConnectionReserved.rows[0]?.expiration_date
    );
    const expiration_date_UTC = new Date(
      expiration_date.getTime() -
        expiration_date.getTimezoneOffset() * 60 * 1000
    ).toUTCString();
    //isConnectionReserved.rows[0]?.expiration_date
    console.log(expiration_date.getTimezoneOffset());
    console.log(now);
    console.log(expiration_date);
    console.log(expiration_date_UTC);

    console.log(now > expiration_date_UTC);

    if (!!isConnectionReserved.rowCount && now < expiration_date_UTC) {
      const error = new Error(
        "Unable to create new reservation, connection already reserved"
      );
      error.code = 403;
      throw error;
    }

    const result = await postStartReservation(db, id, connectionId);

    if (result instanceof Error) {
      throw result;
    }

    const { rows, rowCount } = result;

    rows[0].reservation_date = now;
    rows[0].expiration_date = expiration_date_UTC;

    res.status(200).json({
      success: true,
      count: rowCount,
      data: rows,
    });
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    next(error);
  }
};
