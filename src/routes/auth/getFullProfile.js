const { getFullProfile } = require("../../queries/users");

module.exports = (db) => async (req, res, next) => {
  const { id } = req.user;

  try {
    const result = await getFullProfile(db, id);

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
