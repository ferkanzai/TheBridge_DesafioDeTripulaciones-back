const { getUserById } = require("../../queries/users");

module.exports = (db) => async (req, res, next) => {
  const { id } = req.user;

  try {
    const result = await getUserById(db, id);

    if (!result) {
      next(new Error("something went wrong"));
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
