const { sql } = require("slonik");

const getTest = async (db) => {
  try {
    return await db.query(sql`
      SELECT * FROM test;
    `);
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    return null;
  }
};

module.exports = {
  getTest,
};
