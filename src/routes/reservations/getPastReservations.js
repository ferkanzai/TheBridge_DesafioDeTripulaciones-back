const { getPastReservations } = require("../../queries/reservations");
const { convertDateToUTC } = require("../../utils/converDateToUTC");

module.exports = (db) => async (req, res, next) => {
  const { id } = req.user;

  try {
    const result = await getPastReservations(db, id);

    if (result instanceof Error) {
      next(result);
      return;
    }

    const { rows, rowCount } = result;

    const rowsMapped = rows.map((row) => ({
      ...row,
      reservation_date: convertDateToUTC(row.reservation_date),
      expiration_date: convertDateToUTC(row.expiration_date),
    }));

    res.status(200).json({
      success: true,
      count: rowCount,
      data: rowsMapped,
    });
  } catch (error) {
    console.info("> something went wrong: ", error.message);
  }
};
