const { sql } = require("slonik");

const getAllBrands = async (db) => {
  try {
    return await db.query(sql`
      SELECT brands.*, COUNT(cars.available) AS count
        FROM brands JOIN cars ON cars.brand_id = brands.id
      WHERE cars.available = true
      GROUP BY brands.id, brands.name
      ;
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
