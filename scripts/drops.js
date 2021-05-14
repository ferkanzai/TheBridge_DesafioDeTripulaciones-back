const db = require("../config/db");
const { sql } = require("slonik");

const dropUsers = async () => {
  try {
    await db.query(sql`
      DROP TABLE users;
    `);
  } catch (error) {
    console.info("> error dropping users data: ", error.message);
  }
};

const dropBrands = async () => {
  try {
    await db.query(sql`
      DROP TABLE brands;
    `);
  } catch (error) {
    console.info("> error dropping brands data: ", error.message);
  }
};

const dropCars = async () => {
  try {
    await db.query(sql`
      DROP TABLE cars;
    `);
  } catch (error) {
    console.info("> error dropping cars data:", error.message);
  }
};

const dropUserCar = async () => {
  try {
    await db.query(sql`
      DROP TABLE user_car;
    `);
  } catch (error) {
    console.info("> error dropping user car data:", error.message);
  }
};

const dropOperators = async () => {
  try {
    await db.query(sql`
      DROP TABLE operators;
    `);
  } catch (error) {
    console.info("> error dropping operators data:", error.message);
  }
};

const dropChargePoints = async () => {
  try {
    await db.query(sql`
      DROP TABLE charge_points;
    `);
  } catch (error) {
    console.info("> error dropping charge points data:", error.message);
  }
};

const dropUserChargePointFavorites = async () => {
  try {
    await db.query(sql`
      DROP TABLE user_charge_point_favorites;
    `);
  } catch (error) {
    console.info(
      "> error dropping user charge point favorite data:",
      error.message
    );
  }
};

const dropConnections = async () => {
  try {
    await db.query(sql`
      DROP TABLE connections;
    `);
  } catch (error) {
    console.info("> error dropping connections data:", error.message);
  }
};

const dropChargePointConnections = async () => {
  try {
    await db.query(sql`
      DROP TABLE charge_point_connections;
    `);
  } catch (error) {
    console.info(
      "> error dropping charge point connections data:",
      error.message
    );
  }
};

const dropReservationsUserConnections = async () => {
  try {
    await db.query(sql`
      DROP TABLE reservations;
    `);
  } catch (error) {
    console.info("> error dropping reservations data:", error.message);
  }
};

(async () => {
  console.info("> dropping data");
  await dropUserChargePointFavorites();
  await dropUserCar();
  await dropCars();
  await dropBrands();
  await dropReservationsUserConnections();
  await dropUsers();
  // await dropChargePointConnections();
  await dropConnections();
  await dropChargePoints();
  await dropOperators();
  console.info("> done!");
})();
