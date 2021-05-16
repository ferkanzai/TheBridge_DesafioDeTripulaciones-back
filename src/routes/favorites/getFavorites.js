const { getFavorites } = require("../../queries/favorites");

module.exports = (db) => async (req, res, next) => {
  const { id } = req.user;

  try {
    const result = await getFavorites(db, id);

    if (result instanceof Error) {
      next(result);
      return;
    }

    console.log(result);

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
