const { getReservations } = require("../../queries/reservations");

module.exports = (db) => async (req, res, next) => {
  try {
    const result = await getReservations(db);

    if (result instanceof Error) {
      next(result);
      return;
    }

    const { rowCount } = result;

    res.status(200).json({
      success: true,
      count: rowCount,
    });
  } catch (error) {
    console.info("> something went wrong: ", error.message);
  }
};
