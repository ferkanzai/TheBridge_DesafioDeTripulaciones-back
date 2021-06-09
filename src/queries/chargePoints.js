const { sql } = require("slonik");

const getAllChargePoints = async (db, latitude, longitude) => {
  try {
    return await db.query(sql`
      SELECT cp.*, distance.*, o.name AS operator, o.cost AS price FROM charge_points AS cp
        JOIN operators AS o ON cp.operator_id = o.id,
        LATERAL distance(cp.latitude, cp.longitude, ${latitude}, ${longitude}) distance
    `);
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    return error;
  }
};

const getChargePointsByDistance = async (db, latitude, longitude, distance) => {
  try {
    return await db.query(sql`
      SELECT cp.*, distance.*, o.name AS operator_name, o.cost AS price
      FROM charge_points AS cp JOIN operators AS o ON o.id = cp.operator_id,
          LATERAL distance(cp.latitude, cp.longitude, ${latitude}, ${longitude}) distance
      WHERE distance < ${distance}
    `);
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    return error;
  }
};

const postRate = async (db, userId, chargePointId, rating) => {
  try {
    return await db.transaction(async (tx) => {
      const userRate = await tx.query(sql`
        INSERT INTO user_rating (
          user_id, charge_point_id, rating
        ) VALUES (
          ${userId}, ${chargePointId}, ${rating}
        ) RETURNING *;
      `);

      await tx.query(sql`
        UPDATE charge_points
        SET votes = votes + 1, rating = ((rating * votes) + ${rating}) / (votes + 1)
        WHERE id = ${chargePointId};
      `);

      return userRate;
    });
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

const getCompatible = async (db, carIds) => {
  try {
    return await db.transaction(async (tx) => {
      const chargeTypes = await tx.many(sql`
        SELECT charge_port, fast_charge_port FROM cars WHERE id = ANY(${sql.array(
          carIds,
          "int4"
        )}) 
      `);

      const chargeType = Array.from(
        new Set(
          chargeTypes.map((type) => type.charge_port).filter((type) => type)
        )
      );

      const fastChargeType = Array.from(
        new Set(
          chargeTypes
            .map((type) => type.fast_charge_port)
            .filter((type) => type)
        )
      );

      const allTypes = [...chargeType, ...fastChargeType];

      const newCP = [];

      for (const type of allTypes) {
        newCP.push(
          ...(await tx.many(sql`
          SELECT DISTINCT cp.*, o.name AS operator_name, o.cost AS price
            FROM charge_points AS cp JOIN connections AS c ON cp.id = c.charge_point_id
          JOIN operators AS o ON cp.operator_id = o.id
          WHERE c.connection_type ILIKE ('%' || ${type} || '%') 
        `))
        );
      }

      return Array.from(new Set(newCP));
    });
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

const getCompatibleByDistance = async (
  db,
  carIds,
  latitude,
  longitude,
  distance
) => {
  try {
    return await db.transaction(async (tx) => {
      const chargeTypes = await tx.many(sql`
        SELECT charge_port, fast_charge_port FROM cars WHERE id = ANY(${sql.array(
          carIds,
          "int4"
        )}) 
      `);

      const chargeType = Array.from(
        new Set(
          chargeTypes.map((type) => type.charge_port).filter((type) => type)
        )
      );

      const fastChargeType = Array.from(
        new Set(
          chargeTypes
            .map((type) => type.fast_charge_port)
            .filter((type) => type)
        )
      );

      const allTypes = [...chargeType, ...fastChargeType];

      const newCP = [];

      for (const type of allTypes) {
        newCP.push(
          ...(await tx.many(sql`
          SELECT DISTINCT cp.* 
            o.name AS operator_name, o.cost AS price 
          FROM charge_points AS cp JOIN connections AS c ON cp.id = c.charge_point_id
            JOIN operators AS o ON cp.operator_id = o.id,
            LATERAL distance(cp.latitude, cp.longitude, ${latitude}, ${longitude}) distance
          WHERE c.connection_type ILIKE ('%' || ${type} || '%') AND distance < ${distance};
        `))
        );
      }

      return Array.from(new Set(newCP));
    });
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

const getFiltered = async (
  db,
  latitude,
  longitude,
  distance,
  rating,
  connections,
  operatorsArray
) => {
  try {
    return await db.query(sql`
      SELECT cp.*, o.name AS operator_name, o.cost AS price, distance.*
      FROM charge_points AS cp JOIN operators AS o ON cp.operator_id = o.id,
        LATERAL distance(cp.latitude, cp.longitude, ${latitude}, ${longitude}) distance
      WHERE distance < ${distance} AND o.id = ANY(${sql.array(
      operatorsArray,
      "int4"
    )}) AND cp.rating > ${rating} AND cp.id IN (
          SELECT charge_point_id FROM connections 
            GROUP BY charge_point_id HAVING COUNT(charge_point_id) > ${connections});
      `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

const getFilteredAndCompatible = async (
  db,
  latitude,
  longitude,
  distance,
  rating,
  connections,
  operatorsArray,
  carIds
) => {
  try {
    return await db.transaction(async (tx) => {
      const chargeTypes = await tx.many(sql`
        SELECT charge_port, fast_charge_port FROM cars WHERE id = ANY(${sql.array(
          carIds,
          "int4"
        )}) 
      `);

      const chargeType = Array.from(
        new Set(
          chargeTypes.map((type) => type.charge_port).filter((type) => type)
        )
      );

      const fastChargeType = Array.from(
        new Set(
          chargeTypes
            .map((type) => type.fast_charge_port)
            .filter((type) => type)
        )
      );

      const allTypes = [...chargeType, ...fastChargeType];

      const newCP = [];

      for (const type of allTypes) {
        newCP.push(
          ...(await tx.many(sql`
          SELECT DISTINCT cp.*,
            o.name AS operator_name, o.cost AS price , distance.*
          FROM charge_points AS cp JOIN connections AS c ON cp.id = c.charge_point_id
            JOIN operators AS o ON cp.operator_id = o.id,
            LATERAL distance(cp.latitude, cp.longitude, ${latitude}, ${longitude}) distance
          WHERE c.connection_type ILIKE ('%' || ${type} || '%') AND distance < ${distance}
          AND o.id = ANY(${sql.array(
            operatorsArray,
            "int4"
          )}) AND cp.rating > ${rating} AND cp.id IN (
                SELECT charge_point_id FROM connections 
                  GROUP BY charge_point_id HAVING COUNT(charge_point_id) > ${connections});
        `))
        );
      }

      return Array.from(new Set(newCP));
    });
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

const getSingleChargePoint = async (db, chargePointId, latitude, longitude) => {
  try {
    return await db.query(sql`
    SELECT cp.*, distance.*, o.name AS operator, o.cost AS price FROM charge_points AS cp
    JOIN operators AS o ON cp.operator_id = o.id,
    LATERAL distance(cp.latitude, cp.longitude, ${latitude}, ${longitude}) distance
      WHERE cp.id = ${chargePointId}
    `);
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    return error;
  }
};

module.exports = {
  getAllChargePoints,
  getChargePointsByDistance,
  postRate,
  getCompatible,
  getCompatibleByDistance,
  getFiltered,
  getFilteredAndCompatible,
  getSingleChargePoint,
};
