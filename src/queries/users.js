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

const insertUser = async (db, user) => {
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

module.exports = {
  getUserById,
  getUserByUsername,
  getUserByEmail,
  insertUser,
};
