const { sql } = require("slonik");

const getCarsByBrand = async (db, brand) => {
  try {
    return await db.query(sql`
      SELECT * FROM cars WHERE brand_id IN (
        SELECT id FROM brands WHERE LOWER(name) = LOWER(${brand})
      );
    `);
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    return null;
  }
};

const getAvailableCarsByBrand = async (db, brand) => {
  try {
    return await db.query(sql`
    SELECT * FROM cars WHERE brand_id IN (
      SELECT id FROM brands WHERE LOWER(name) = LOWER(${brand})
    ) AND available = true;
    `);
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    return null;
  }
};

module.exports = {
  getCarsByBrand,
  getAvailableCarsByBrand,
};
