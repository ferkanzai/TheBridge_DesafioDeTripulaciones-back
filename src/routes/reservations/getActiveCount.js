const { getReservations } = require("../../queries/reservations");

module.exports = (db) => async (req, res, next) => {
  const { id } = req.user;

  try {
    const result = await getReservations(db, id);

    if (result instanceof Error) {
      next(result);
      return;
    }

    const { rows, rowCount } = result;

    res.status(200).json({
      success: true,
      count: rowCount,
      data: rows,
    });
  } catch (error) {
    console.info("> something went wrong: ", error.message);
  }
};
