const { getAvailableCarsByBrand } = require("../../queries/cars");

module.exports = (db) => async (req, res, next) => {
  const { brand } = req.params;
  const brandId = Number(brand);

  try {
    if (isNaN(brandId)) {
      const error = new Error("Brand ID must be a number");
      error.code = 400;
      throw error;
    }

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
