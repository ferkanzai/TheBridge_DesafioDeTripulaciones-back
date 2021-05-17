const { sql } = require("slonik");

const getUserById = async (db, id) => {
  try {
    return await db.query(sql`
      SELECT id, email, username FROM users WHERE id = ${id};
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
    return error;
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
    return error;
  }
};

const postAddUserCar = async (db, userId, carId) => {
  try {
    return await db.transaction(async (tx) => {
      const newUserCar = await tx.query(sql`
        INSERT INTO user_car (
          user_id, car_id
        ) VALUES (
          ${userId}, ${carId}
        ) RETURNING *;
      `);

      await tx.query(sql`
        UPDATE users
        SET has_car = NOT has_car
        WHERE id = ${userId} AND has_car = false;
      `);

      return newUserCar;
    });
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

const deleteRemoveUserCar = async (db, userId, userCarId) => {
  try {
    return await db.transaction(async (tx) => {
      const userCars = await tx.query(sql`
        DELETE FROM user_car
        WHERE id = ${userCarId}
        RETURNING (
          SELECT COUNT(user_id)
          FROM user_car 
          WHERE user_id = ${userId}
        );
      `);

      const userHasCars = userCars.rows[0].count - 1;

      if (!userHasCars) {
        await tx.query(sql`
        UPDATE users
        SET has_car = NOT has_car
        WHERE id = ${userId} AND has_car = true;
        `);
      }

      if (!userCars.rowCount) return false;

      return true;
    });
  } catch (error) {
    console.info("> something went wrong:", error.message);
  }
};

const getUserCars = async (db, userId) => {
  try {
    return await db.query(sql`
      SELECT
        user_car.id AS userCarId,
        brands.name,
        cars.model,
        cars.range,
        cars.total_power,
        cars.drive_type,
        cars.battery_useable,
        cars.charge_port,
        cars.fast_charge_port,
        user_car.inserted_at,
        user_car.is_primary_car
      FROM brands 
        JOIN cars ON brands.id = cars.brand_id 
        JOIN user_car ON cars.id = user_car.car_id
      WHERE user_car.user_id = ${userId}
      ORDER BY user_car.inserted_at;
    `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

module.exports = {
  getUserById,
  getUserByUsername,
  getUserByEmail,
  postInsertUser,
  postAddUserCar,
  deleteRemoveUserCar,
  getUserCars,
};
