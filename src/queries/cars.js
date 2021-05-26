const { sql } = require("slonik");

const getCarsByBrand = async (db, brandId) => {
  try {
    return await db.query(sql`
      SELECT * FROM cars WHERE brand_id = ${brandId};
    `);
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    return null;
  }
};

const getAvailableCarsByBrand = async (db, brandId) => {
  try {
    return await db.query(sql`
    SELECT * FROM cars WHERE brand_id = ${brandId} AND available = true;
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
