const { sql } = require("slonik");

const getUserById = async (db, id) => {
  try {
    return await db.query(sql`
      SELECT email, username FROM users WHERE id = ${id};
    `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return null;
  }
};

const getUserByUsername = async (db, username) => {
  try {
    return await db.query(sql`
      SELECT * FROM users WHERE username = ${username};
    `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return null;
  }
};

const getUserByEmail = async (db, email) => {
  try {
    return await db.query(sql`
      SELECT * FROM users WHERE email = ${email};
    `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return null;
  }
};

const postInsertUser = async (db, user) => {
  try {
    return await db.query(sql`
      INSERT INTO users (
        email,
        username,
        password,
        has_car
      ) VALUES (
        ${user.email},
        ${user.username},
        ${user.password},
        ${user.hasCar}
      ) RETURNING id, email, username, has_car, is_active;
    `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
  }
};

const postAddUserCar = async (db, userId, carId) => {
  try {
    return await db.transaction(async (tx) => {
      await tx.query(sql`
        INSERT INTO user_car (
          user_id, car_id
        ) VALUES (
          ${userId}, ${carId}
        );
      `);

      return await tx.query(sql`
        UPDATE users
        SET has_car = NOT has_car
        WHERE id = ${userId} AND has_car = false;
      `);
    });
  } catch (error) {
    console.info("> something went wrong:", error.message);
  }
};

module.exports = {
  getUserById,
  getUserByUsername,
  getUserByEmail,
  postInsertUser,
  postAddUserCar,
};
