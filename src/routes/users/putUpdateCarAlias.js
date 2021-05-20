const { putUpdateCarAlias } = require("../../queries/users");

module.exports = (db) => async (req, res, next) => {
  const { id } = req.user;
  const { userCarId } = req.params;
  const { alias } = req.query;

  try {
    const result = await putUpdateCarAlias(db, id, userCarId, alias);

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
    next(error);
  }
};
