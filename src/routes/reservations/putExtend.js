const { convertDateToUTC } = require("../../utils/converDateToUTC");
const {
  getPastReservations,
  putExtend,
} = require("../../queries/reservations");

module.exports = (db) => async (req, res, next) => {
  const { id } = req.user;
  const { reservationId } = req.params;

  try {
    const pastReservations = await getPastReservations(db, id);

    if (pastReservations instanceof Error) {
      next(pastReservations);
    }

    const isPastReservation = pastReservations.rows.filter(
      (row) => row.id === Number(reservationId)
    );

    if (isPastReservation.length) {
      const error = new Error("Past reservation, can't extend");
      error.code = 400;
      throw error;
    }

    const result = await putExtend(db, reservationId);

    if (result instanceof Error) {
      throw result;
    }

    const { rows, rowCount } = result;

    rows[0].reservation_date = convertDateToUTC(rows[0].reservation_date);
    rows[0].expiration_date = convertDateToUTC(rows[0].expiration_date);

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
