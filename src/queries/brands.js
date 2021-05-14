const { sql } = require("slonik");

const getAllBrands = async (db) => {
  try {
    return await db.query(sql`
      SELECT * FROM brands;
    `);
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    return null;
  }
};

module.exports = {
  getAllBrands,
};
