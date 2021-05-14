const { getAvailableCarsByBrand } = require("../../queries/cars");

module.exports = (db) => async (req, res, next) => {
  const { brand } = req.params;

  try {
    const result = await getAvailableCarsByBrand(db, brand);

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
