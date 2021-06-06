const { getIsFavorite } = require("../../queries/favorites");

module.exports = (db) => async (req, res, next) => {
  const { id } = req.user;
  const { chargePointId } = req.params;

  try {
    const result = await getIsFavorite(db, id, chargePointId);

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
