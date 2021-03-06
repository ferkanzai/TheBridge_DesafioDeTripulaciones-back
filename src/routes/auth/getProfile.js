const { getUserById } = require("../../queries/users");

module.exports = (db) => async (req, res, next) => {
  const { id } = req.user;

  try {
    const result = await getUserById(db, id);

    const { rows, rowCount } = result;

    res.status(200).json({
      success: true,
      count: rowCount,
      data: rows[0],
    });
  } catch (err) {
    next(err);
  }
};
