const db = require("../config/db");
const { sql } = require("slonik");
const fs = require("fs");
const path = require("path");

const chargePoints = require("../scrap/charge-points.json").features;

const prices = ["0", "0.30", "0.40", "0.50"];

const getOperators = (arr) => {
  const operators = arr
    .map((point) => point.properties.poi.operatorInfo?.title)
    .map((point) => {
      if (point === "(Unknown Operator)" || !point) return "Unknown Operator";
      return point;
    });

  return Array.from(new Set(operators));
};

const insertOperators = async (operators) => {
  try {
    await db.transaction(async (tx) => {
      for await (const operator of operators) {
        await tx.query(sql`
          INSERT INTO operators (
            name, cost
          ) VALUES (
            ${operator}, ${prices[Math.floor(Math.random() * prices.length)]}
          );
        `);
      }
    });

    console.info("> operators data inserted");
  } catch (error) {
    console.info("> error inserting operators data:", error.message);
  }
};

const mappingChargePoints = (points) => {
  return points.map((point) => {
    const pointMapped = {
      latitude: point.geometry.coordinates[1],
      longitude: point.geometry.coordinates[0],
      town: point.properties.poi.addressInfo.town || null,
      stateOrProvince: point.properties.poi.addressInfo.stateOrProvince || null,
      country: point.properties.poi.addressInfo.country.isoCode || null,
      name: point.properties.name,
      description: point.properties.description,
      operator:
        point.properties.poi.operatorInfo?.title === "(Unknown Operator)" ||
        !point.properties.poi.operatorInfo?.title
          ? "Unknown Operator"
          : point.properties.poi.operatorInfo.title,
    };

    const connectionsMapped = point.properties.poi.connections.map(
      (connection) => ({
        connectionType: connection.connectionType.title,
        powerKw: connection.powerKW || null,
        isFastCharge: connection.level
          ? connection.level.isFastChargeCapable
          : false,
        currentType: connection.currentType
          ? connection.currentType.title.split(" ")[0]
          : null,
        quantity: connection.quantity || 0,
      })
    );

    return { pointMapped, connectionsMapped };
  });
};

const insertChargePoints = async (points) => {
  try {
    await db.transaction(async (tx) => {
      for await (const point of points) {
        const pointOperator = (
          await tx.query(sql`
          SELECT id FROM operators WHERE name = ${point.pointMapped.operator}
        `)
        ).rows[0].id;

        const pointIdResult = await tx.query(sql`
          INSERT INTO charge_points (
            latitude,
            longitude,
            town,
            state_or_province,
            country,
            name,
            description,
            operator_id
          ) VALUES (
            ${point.pointMapped.latitude},
            ${point.pointMapped.longitude},
            ${point.pointMapped.town},
            ${point.pointMapped.stateOrProvince},
            ${point.pointMapped.country},
            ${point.pointMapped.name},
            ${point.pointMapped.description},
            ${pointOperator}
          ) ON CONFLICT DO NOTHING RETURNING id;
        `);

        const pointId = pointIdResult.rows[0].id;

        for await (connection of point.connectionsMapped) {
          await tx.query(sql`
            INSERT INTO connections (
              connection_type,
              power_kw,
              is_fast_charge,
              current_type,
              quantity,
              charge_point_id
            ) VALUES (
              ${connection.connectionType},
              ${connection.powerKw},
              ${connection.isFastCharge},
              ${connection.currentType},
              ${connection.quantity},
              ${pointId}
            ) ON CONFLICT DO NOTHING;
          `);
        }
      }
    });

    console.info("> charge points data inserted");
  } catch (error) {
    console.info("> error inserting charge points data:", error);
  }
};

const mappingCars = (cars) => {
  const carsMapped = cars.map((car) => {
    const carData = {
      carModel: car.carName.split(" ").slice(1).join(" "),
      available: car.available,
      releaseDate: car.releaseDate,
      acceleration: Number(
        car.performanceData["Acceleration 0 - 100 km/h"]?.split(" ")[0] ||
          car.performanceData["Acceleration 0 - 100 km/h *"].split(" ")[0]
      ),
      topSpeed: Number(
        car.performanceData["Top Speed"]?.split(" ")[0] ||
          car.performanceData["Top Speed *"].split(" ")[0]
      ),
      range: Number(
        car.performanceData["Electric Range"]?.split(" ")[0] ||
          car.performanceData["Electric Range *"].split(" ")[0]
      ),
      totalPower: Number(
        car.performanceData["Total Power"]?.split(" ")[0] ||
          car.performanceData["Total Power *"].split(" ")[0]
      ),
      driveType: car.performanceData.Drive || null,
      batteryCapacity: Number(
        car.chargingData["Battery Capacity\t\t\t\t\t\t\t"]?.split(" ")[0] ||
          car.chargingData["Battery Capacity\t\t\t\t\t\t\t*"].split(" ")[0]
      ),
      batteryUseable: Number(
        car.chargingData["Battery Useable"]?.split(" ")[0] ||
          car.chargingData["Battery Useable*"].split(" ")[0]
      ),
      chargePort:
        car.chargingData["Charge Port"] ||
        car.chargingData["Charge Port *"] ||
        null,
      chargePower: Number(
        car.chargingData["Charge Power"]?.split(" ")[0] ||
          car.chargingData["Charge Power *"].split(" ")[0]
      ),
      chargeSpeed: Number(
        car.chargingData["Charge Speed"]?.split(" ")[0] ||
          car.chargingData["Charge Speed *"].split(" ")[0]
      ),
      fastChargePort:
        car.chargingData["Fastcharge Port *"] === "-" ||
        car.chargingData["Fastcharge Port"] === "-"
          ? null
          : car.chargingData["Fastcharge Port *"] ||
            car.chargingData["Fastcharge Port"],
      fastChargePower:
        Number(car.chargingData["Fastcharge Power (max)"]?.split(" ")[0]) ||
        Number(car.chargingData["Fastcharge Power (max) *"]?.split(" ")[0]) ||
        0,
      fastChargeSpeed:
        car.chargingData["Fastcharge Speed"] === "-" ||
        car.chargingData["Fastcharge Speed *"] === "-"
          ? 0
          : Number(
              car.chargingData["Fastcharge Speed"]?.split(" ")[0] ||
                car.chargingData["Fastcharge Speed *"].split(" ")[0]
            ),
      consumption: Number(
        car.efficiencyData["Vehicle Consumption"]?.split(" ")[0] ||
          car.efficiencyData["Vehicle Consumption *"].split(" ")[0]
      ),
      co2Emissions: Number(car.efficiencyData["CO2 Emissions"].split(" ")[0]),
      length: Number(
        car.dimensionsData["Length"]?.split(" ")[0] ||
          car.dimensionsData["Length *"].split(" ")[0]
      ),
      width: Number(
        car.dimensionsData["Width"]?.split(" ")[0] ||
          car.dimensionsData["Width *"].split(" ")[0]
      ),
      height: Number(
        car.dimensionsData["Height"]?.split(" ")[0] ||
          car.dimensionsData["Height *"].split(" ")[0]
      ),
      wheelbase:
        car.dimensionsData["Wheelbase"] === "No Data" ||
        car.dimensionsData["Wheelbase *"] === "No Data"
          ? 0
          : Number(
              car.dimensionsData["Wheelbase"]?.split(" ")[0] ||
                car.dimensionsData["Wheelbase *"].split(" ")[0]
            ),
      weight: Number(
        car.dimensionsData["Weight Unladen (EU)"]?.split(" ")[0] ||
          car.dimensionsData["Weight Unladen (EU) *"].split(" ")[0]
      ),
      maxPayload:
        car.dimensionsData["Max. Payload"] === "No Data" ||
        car.dimensionsData["Max. Payload *"] === "No Data"
          ? 0
          : Number(
              car.dimensionsData["Max. Payload"]?.split(" ")[0] ||
                car.dimensionsData["Max. Payload *"].split(" ")[0]
            ),
      cargoVolume:
        car.dimensionsData["Cargo Volume"] === "No Data" ||
        car.dimensionsData["Cargo Volume *"] === "No Data"
          ? 0
          : Number(
              car.dimensionsData["Cargo Volume"]?.split(" ")[0] ||
                car.dimensionsData["Cargo Volume *"].split(" ")[0]
            ),
      seats: Number(car.miscellaneousData["Seats "]?.split(" ")[0]),
      platform:
        car.miscellaneousData["Platform"] === "No Data"
          ? 0
          : car.miscellaneousData["Platform"],
      carBody: car.miscellaneousData["Car Body"],
    };

    const brand = car.carName.split(" ")[0];

    return {
      carData,
      brand,
    };
  });

  return carsMapped;
};

const getBrands = (cars) => {
  const brands = cars.map((car) => car.carName.split(" ")[0]);

  return new Set(brands);
};

const insertBrands = async (brands) => {
  try {
    await db.transaction(async (tx) => {
      for await (const brand of brands) {
        await tx.query(sql`
          INSERT INTO brands (
            name
          ) VALUES (${brand}) ON CONFLICT DO NOTHING;
        `);
      }
    });

    console.info("> brands data inserted");
  } catch (error) {
    console.info("> error inserting brands data:", error.message);
  }
};

const insertCars = async (cars) => {
  try {
    await db.transaction(async (tx) => {
      for await (const car of cars) {
        const carBrand = (
          await tx.query(sql`
          SELECT id FROM brands WHERE name = ${car.brand}
        `)
        ).rows[0];

        await tx.query(sql`
          INSERT INTO cars (
            brand_id,
            model,
            available,
            release_date,
            acceleration,
            top_speed,
            range,
            total_power,
            drive_type,
            battery_capacity,
            battery_useable,
            charge_port,
            charge_power,
            charge_speed,
            fast_charge_port,
            fast_charge_power,
            fast_charge_speed,
            consumption,
            co2_emissions,
            length,
            width,
            height,
            wheelbase,
            weight,
            max_payload,
            cargo_volume,
            seats,
            platform,
            car_body
          ) VALUES (
            ${carBrand.id},
            ${car.carData.carModel},
            ${car.carData.available},
            ${car.carData.releaseDate},
            TO_NUMBER(NULLIF(${car.carData.acceleration}, 'NaN'), '99G999D9S'),
            TO_NUMBER(NULLIF(${car.carData.topSpeed}, 'NaN'), '99G999D9S'),
            TO_NUMBER(NULLIF(${car.carData.range}, 'NaN'), '99G999D9S'),
            TO_NUMBER(NULLIF(${car.carData.totalPower}, 'NaN'), '99G999D9S'),
            ${car.carData.driveType},
            TO_NUMBER(NULLIF(${car.carData.batteryCapacity}, 'NaN'), '99G999D9S'),
            TO_NUMBER(NULLIF(${car.carData.batteryUseable}, 'NaN'), '99G999D9S'),
            ${car.carData.chargePort},
            TO_NUMBER(NULLIF(${car.carData.chargePower}, 'NaN'), '99G999D9S'),
            TO_NUMBER(NULLIF(${car.carData.chargeSpeed}, 'NaN'), '99G999D9S'),
            ${car.carData.fastChargePort},
            TO_NUMBER(NULLIF(${car.carData.fastChargePower}, 'NaN'), '99G999D9S'),
            TO_NUMBER(NULLIF(${car.carData.fastChargeSpeed}, 'NaN'), '99G999D9S'),
            TO_NUMBER(NULLIF(${car.carData.consumption}, 'NaN'), '99G999D9S'),
            TO_NUMBER(NULLIF(${car.carData.co2Emissions}, 'NaN'), '99G999D9S'),
            TO_NUMBER(NULLIF(${car.carData.length}, 'NaN'), '99G999D9S'),
            TO_NUMBER(NULLIF(${car.carData.width}, 'NaN'), '99G999D9S'),
            TO_NUMBER(NULLIF(${car.carData.height}, 'NaN'), '99G999D9S'),
            TO_NUMBER(NULLIF(${car.carData.wheelbase}, 'NaN'), '99G999D9S'),
            TO_NUMBER(NULLIF(${car.carData.weight}, 'NaN'), '99G999D9S'),
            TO_NUMBER(NULLIF(${car.carData.maxPayload}, 'NaN'), '99G999D9S'),
            TO_NUMBER(NULLIF(${car.carData.cargoVolume}, 'NaN'), '99G999D9S'),
            TO_NUMBER(NULLIF(${car.carData.seats}, 'NaN'), '99G999D9S'),
            ${car.carData.platform},
            ${car.carData.carBody}
          ) ON CONFLICT DO NOTHING;
        `);
      }
    });

    console.info("> cars data inserted");
  } catch (error) {
    console.info("> error inserting cars data:", error);
  }
};

(async () => {
  const allBrandsRepetead = [];
  const allCars = [];

  for (const file of Array.from({ length: 19 }, (_, i) => i)) {
    const cars = JSON.parse(
      fs.readFileSync(path.join(__dirname, `../scrap/cars-${file}.json`))
    );

    const brands = getBrands(cars);
    brands.forEach((brand) => allBrandsRepetead.push(brand));

    const mappedCars = mappingCars(cars);
    mappedCars.forEach((car) => allCars.push(car));
  }

  const allBrands = new Set(allBrandsRepetead);
  const operators = getOperators(chargePoints);
  const points = mappingChargePoints(chargePoints);
  // console.log(points);
  await insertBrands(allBrands);
  await insertCars(allCars);
  await insertOperators(operators);
  await insertChargePoints(points);

  // const prices = chargePoints.map(
  //   (operator) => operator.properties.poi.usageCost
  // );

  // fs.writeFileSync(
  //   path.join(__dirname, "../scrap/prices.json"),
  //   JSON.stringify(prices, null, 2)
  // );
})();
