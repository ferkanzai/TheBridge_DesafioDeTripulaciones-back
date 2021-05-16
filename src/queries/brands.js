const { sql } = require("slonik");

const getAllBrands = async (db) => {
  try {
    return await db.query(sql`
      SELECT * FROM brands;
    `);
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    return error;
  }
};

const postInsertBrand = async (db, brandName) => {
  try {
    return await db.query(sql`
      INSERT INTO brands (
        name
      ) VALUES (
        INITCAP(${brandName})
      )
      RETURNING name;
    `);
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    return error;
  }
};

module.exports = {
  getAllBrands,
  postInsertBrand,
};
