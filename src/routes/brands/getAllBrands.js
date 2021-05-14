const { getAllBrands } = require("../../queries/brands");

module.exports = (db) => async (req, res, next) => {
  try {
    const result = await getAllBrands(db);

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
