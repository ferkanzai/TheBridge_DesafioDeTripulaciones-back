const { sql } = require("slonik");

const getUserById = async (db, id) => {
  try {
    return await db.query(sql`
      SELECT id FROM users WHERE id = ${id};
    `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return null;
  }
};

const getUserByEmail = async (db, email) => {
  try {
    return await db.query(sql`
      SELECT id, password FROM users WHERE email = ${email};
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
        password,
        name,
        has_car
      ) VALUES (
        ${user.email},
        ${user.password},
        ${user.name},
        ${user.hasCar}
      ) RETURNING id, email, has_car, is_active;
    `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

const postAddUserCar = async (db, userId, carId) => {
  try {
    return await db.transaction(async (tx) => {
      const insertedCar = await tx.query(sql`
        INSERT INTO user_car (
          user_id, car_id
        ) VALUES (
          ${userId}, ${carId}
        ) RETURNING *;
      `);

      const newUserCarId = insertedCar.rows[0].id;

      const newUserCar = await tx.query(sql`
        SELECT
          user_car.id AS user_car_id,
          brands.name,
          cars.id AS car_id,
          cars.model,
          cars.range,
          cars.total_power,
          cars.drive_type,
          cars.battery_useable,
          cars.charge_port,
          cars.fast_charge_port,
          user_car.alias,
          user_car.inserted_at,
          user_car.is_primary_car
        FROM brands 
          JOIN cars ON brands.id = cars.brand_id 
          JOIN user_car ON cars.id = user_car.car_id
        WHERE user_car.id = ${newUserCarId}
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
        AND is_primary_car <> true
        RETURNING (
          SELECT COUNT(user_id)
          FROM user_car 
          WHERE user_id = ${userId}
        );
      `);

      if (!userCars.rowCount) {
        const error = new Error(
          "Please, change primary car before deleting it"
        );
        error.code = 403;
        throw error;
      }

      const userHasCars = userCars.rows[0].count - 1;

      if (!userHasCars) {
        await tx.query(sql`
        UPDATE users
        SET has_car = NOT has_car
        WHERE id = ${userId} AND has_car = true;
        `);
      }

      if (!userCars.rowCount)
        throw new Error("Trying to delete a row that does not exist");

      return userCars;
    });
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

const getUserCars = async (db, userId) => {
  try {
    return await db.query(sql`
      SELECT
        user_car.id AS user_car_id,
        brands.name,
        cars.id AS car_id,
        cars.model,
        cars.range,
        cars.total_power,
        cars.drive_type,
        cars.battery_useable,
        cars.charge_port,
        cars.fast_charge_port,
        user_car.alias,
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

const getSingleUserCarById = async (db, userId, userCarId) => {
  try {
    return await db.query(sql`
      SELECT
        user_car.id AS user_car_id,
        brands.name,
        cars.id AS car_id,
        cars.model,
        cars.range,
        cars.total_power,
        cars.drive_type,
        cars.battery_useable,
        cars.charge_port,
        cars.fast_charge_port,
        user_car.alias,
        user_car.inserted_at,
        user_car.is_primary_car
      FROM brands 
        JOIN cars ON brands.id = cars.brand_id 
        JOIN user_car ON cars.id = user_car.car_id
      WHERE user_car.user_id = ${userId} AND user_car.id = ${userCarId};
    `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

const putUpdateCarAlias = async (db, userId, userCarId, alias) => {
  try {
    return await db.query(sql`
      UPDATE user_car
        SET alias = ${alias}
        WHERE id = ${userCarId} AND user_id = ${userId}
      RETURNING *;
    `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

const putChangeUserCarPrimary = async (db, userId, userCarId) => {
  try {
    return await db.transaction(async (tx) => {
      const pastPrimary = await tx.query(sql`
        UPDATE user_car
          SET is_primary_car = false
          WHERE user_id = ${userId} AND is_primary_car = true
        RETURNING *;
      `);

      const newPrimary = await tx.query(sql`
        UPDATE user_car
          SET is_primary_car = true
          WHERE user_id = ${userId} AND id = ${userCarId}
        RETURNING *;
      `);

      if (!pastPrimary.rowCount) {
        const error = new Error("No primary car has been changed");
        error.code = 403;
        throw error;
      }

      return newPrimary;
    });
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

module.exports = {
  getUserById,
  getUserByEmail,
  postInsertUser,
  postAddUserCar,
  deleteRemoveUserCar,
  getUserCars,
  putUpdateCarAlias,
  putChangeUserCarPrimary,
  getSingleUserCarById,
};
