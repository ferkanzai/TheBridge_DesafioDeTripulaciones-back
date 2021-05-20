require("dotenv").config();
const slonik = require("slonik");

module.exports = slonik.createPool(process.env.DATABASE_URL);
