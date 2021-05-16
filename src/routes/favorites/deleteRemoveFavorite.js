const { deleteRemoveFavorite } = require("../../queries/favorites");

module.exports = (db) => async (req, res, next) => {
  const { favoriteId } = req.params;

  try {
    const result = await deleteRemoveFavorite(db, favoriteId);

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
