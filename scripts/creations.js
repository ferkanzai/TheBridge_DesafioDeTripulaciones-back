const db = require("../config/db");
const { sql } = require("slonik");

const createUserTable = async () => {
  try {
    await db.query(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL UNIQUE,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        has_car BOOLEAN NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true
      );
    `);

    console.info("> Users table created");
  } catch (error) {
    console.info("> error creating users table:", error.message);
  }
};

const createBrandsTable = async () => {
  try {
    await db.query(sql`
      CREATE TABLE IF NOT EXISTS brands (
        id SERIAL UNIQUE,
        name TEXT UNIQUE NOT NULL
      );
    `);

    console.info("> Brands table created");
  } catch (error) {
    console.info("> error creating brands table:", error.message);
  }
};

const createCarsTable = async () => {
  try {
    await db.query(sql`
      CREATE TABLE IF NOT EXISTS cars (
        id SERIAL UNIQUE,
        brand_id INTEGER NOT NULL REFERENCES brands (id) ON DELETE SET NULL,
        model TEXT NOT NULL,
        available BOOLEAN NOT NULL,
        release_date DATE,
        acceleration FLOAT,
        top_speed INTEGER,
        range INTEGER,
        total_power INTEGER,
        drive_type TEXT,
        battery_capacity FLOAT,
        battery_useable FLOAT,
        charge_port TEXT NOT NULL,
        charge_power FLOAT,
        charge_speed INTEGER,
        fast_charge_port TEXT,
        fast_charge_power INTEGER,
        fast_charge_speed INTEGER,
        consumption INTEGER,
        co2_emissions INTEGER,
        length INTEGER,
        width INTEGER,
        height INTEGER,
        wheelbase INTEGER,
        weight INTEGER,
        max_payload INTEGER,
        cargo_volume INTEGER,
        seats INTEGER,
        platform TEXT,
        car_body TEXT
      );
    `);

    console.info("> Cars table created");
  } catch (error) {
    console.info("> error creating cars table:", error.message);
  }
};

const createUserCarTable = async () => {
  try {
    await db.query(sql`
      CREATE TABLE IF NOT EXISTS user_car (
        id SERIAL UNIQUE,
        user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        car_id INTEGER NOT NULL REFERENCES cars (id) ON DELETE CASCADE,
        alias TEXT,
        inserted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(2),
        is_primary_car BOOLEAN DEFAULT false
      );

      CREATE OR REPLACE FUNCTION check_if_primary_car() RETURNS TRIGGER AS $primary_car$
        BEGIN
          IF (
            SELECT COUNT(is_primary_car) FROM user_car 
              WHERE user_id = NEW.user_id AND is_primary_car = true
              GROUP BY user_id
            ) IS NULL THEN
            NEW.is_primary_car := true;
          END IF;
          RETURN NEW;
        END;
      $primary_car$ LANGUAGE plpgsql;

      CREATE TRIGGER primary_car_trigger
      BEFORE INSERT ON user_car
      FOR EACH ROW
      EXECUTE PROCEDURE check_if_primary_car();
    `);

    console.info("> User Car table created");
  } catch (error) {
    console.info("> error creating user car table:", error.message);
  }
};

const createOperatorsTable = async () => {
  try {
    await db.query(sql`
      CREATE TABLE IF NOT EXISTS operators (
        id SERIAL UNIQUE,
        name TEXT NOT NULL,
        cost FLOAT
      );
    `);

    console.info("> Operators table created");
  } catch (error) {
    console.info("> error creating operators table:", error.message);
  }
};

const createChargePointsTable = async () => {
  try {
    await db.query(sql`
      CREATE TABLE IF NOT EXISTS charge_points (
        id SERIAL UNIQUE,
        latitude FLOAT NOT NULL,
        longitude FLOAT NOT NULL,
        last_verified TIMESTAMP,
        town TEXT,
        state_or_province TEXT,
        country TEXT,
        name TEXT,
        description TEXT,
        operator_id INTEGER REFERENCES operators (id) ON DELETE SET NULL,
        waiting_time INTEGER,
        rating FLOAT,
        votes INTEGER
      );

      CREATE OR REPLACE FUNCTION distance(lat1 FLOAT, lon1 FLOAT, lat2 FLOAT, lon2 FLOAT) RETURNS FLOAT AS $$
      DECLARE                                                   
          x float = 111.12 * (lat2 - lat1);                           
          y float = 111.12 * (lon2 - lon1) * cos(lat1 / 92.215);        
      BEGIN                                                     
          RETURN sqrt(x * x + y * y);                               
      END  
      $$ LANGUAGE plpgsql;
    `);

    console.info("> Charge Points table created");
  } catch (error) {
    console.info("> error creating charge points table:", error.message);
  }
};

const createUserChargePointFavoritesTable = async () => {
  try {
    await db.query(sql`
      CREATE TABLE IF NOT EXISTS user_charge_point_favorites (
        id SERIAL UNIQUE,
        user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        charge_point_id INTEGER NOT NULL REFERENCES charge_points (id) ON DELETE CASCADE,
        CONSTRAINT user_charge_point_constraint UNIQUE (user_id, charge_point_id)
      );
    `);

    console.info("> User charge point favorites table created");
  } catch (error) {
    console.info(
      "> error creating user charge point favorites table:",
      error.message
    );
  }
};

const createConnectionsTable = async () => {
  try {
    await db.query(sql`
      CREATE TABLE IF NOT EXISTS connections (
        id SERIAL UNIQUE,
        connection_type TEXT NOT NULL,
        power_kw FLOAT,
        is_fast_charge BOOLEAN NOT NULL DEFAULT false,
        current_type TEXT,
        quantity INTEGER NOT NULL DEFAULT 1,
        charge_point_id INTEGER NOT NULL REFERENCES charge_points (id) ON DELETE CASCADE
      );
    `);

    console.info("> Connections table created");
  } catch (error) {
    console.info("> error creating connections table:", error.message);
  }
};

const createReservationsUserConnection = async () => {
  try {
    await db.query(sql`
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL UNIQUE,
        user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        connection_id INTEGER NOT NULL REFERENCES connections (id) ON DELETE CASCADE,
        reservation_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP(2) AT TIME ZONE 'utc'),
        expiration_date TIMESTAMP WITHOUT TIME ZONE,
        charge_end_date TIMESTAMP WITHOUT TIME ZONE,
        is_past_reservation BOOLEAN DEFAULT false,
        CONSTRAINT reservation_constraint UNIQUE (user_id, connection_id)
      );

      CREATE OR REPLACE FUNCTION add_expiration_date() RETURNS TRIGGER AS $date$
        BEGIN
          NEW.expiration_date := (CURRENT_TIMESTAMP(2) AT TIME ZONE 'utc') + INTERVAL '20 minutes';
          RETURN NEW;
        END;
      $date$ LANGUAGE plpgsql;

      CREATE TRIGGER expiration_date_trigger
      BEFORE INSERT ON reservations
      FOR EACH ROW
      EXECUTE PROCEDURE add_expiration_date();
    `);

    console.info("> User connection table (reservations) created");
  } catch (error) {
    console.info(
      "> error creating user connection (reservations) table:",
      error.message
    );
  }
};

const createUserRatingTable = async () => {
  try {
    await db.query(sql`
      CREATE TABLE IF NOT EXISTS user_rating (
        id SERIAL UNIQUE,
        user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        charge_point_id INTEGER NOT NULL REFERENCES charge_points (id) ON DELETE CASCADE,
        rating INTEGER NOT NULL
      );
    `);

    console.info("> User rating table created");
  } catch (error) {
    console.info("> error creating user rating table:", error.message);
  }
};

(async () => {
  await createUserTable();
  await createBrandsTable();
  await createCarsTable();
  await createUserCarTable();
  await createOperatorsTable();
  await createChargePointsTable();
  await createUserChargePointFavoritesTable();
  await createConnectionsTable();
  await createReservationsUserConnection();
  await createUserRatingTable();
})();
