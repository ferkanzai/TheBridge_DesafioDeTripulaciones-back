const { postInsertBrand } = require("../../queries/brands");

module.exports = (db) => async (req, res, next) => {
  const { brandName } = req.body;

  try {
    const result = await postInsertBrand(db, brandName);

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
