const scrapeit = require("scrape-it");

const options = {
  cars: {
    listItem: "div.list-item",
    data: {
      carName: "div.title-wrap > h2",
      carURL: {
        selector: "div.title-wrap > h2 > a",
        attr: "href",
      },
      batteryUsableKwh: "div.title-wrap > div.subtitle > span.battery",
      available: {
        selector: "div.title-wrap > span.not-current",
        convert: (x) => (x ? false : true),
      },
      releaseDate: {
        selector: "div.title-wrap > span.date_from",
        convert: (x) => new Date(x * 1000),
      },
    },
  },
};

const carPageOptions = {
  car: {
    listItem: "#detail-page",
    data: {
      carName: "header.sub-header > h1",
    },
  },
};

const BASE_URL = "https://ev-database.org";

const CARS_DB_URL =
  "https://ev-database.org/compare/newest-upcoming-electric-vehicle#sort:path~type~order=.id~number~desc|range-slider-range:prev~next=0~1200|range-slider-acceleration:prev~next=2~23|range-slider-topspeed:prev~next=110~450|range-slider-battery:prev~next=10~200|range-slider-eff:prev~next=100~300|range-slider-fastcharge:prev~next=0~1500|paging:currentPage=0|paging:number=all";

const allCars = async () => {
  return scrapeit(CARS_DB_URL, options);
};

const getCarName = async (url) => {
  return scrapeit(`${BASE_URL}${url}`, carPageOptions);
};

const main = async () => {
  const response = await allCars();
  const cars = await response.data.cars;
  console.log(cars);
  for (const car of cars) {
    const url = car.carURL;
    // const carResponse = await getCarName(url);
    // // console.log(carResponse.data);
    // const name = await carResponse.data;
    // console.log(name);
    // console.log(name.carName);
    getCarName(url).then((res) => console.log(res.data));
  }
};

main();
