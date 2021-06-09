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

    if (!!isConnectionReserved.rowCount) {
      const error = new Error(
        "Unable to create new reservation, connection already reserved"
      );
      error.code = 403;
      throw error;
    }

    const result = await postStartReservation(db, id, connectionId, new Date());

    if (result instanceof Error) {
      throw result;
    }

    const { rows, rowCount } = result;

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
