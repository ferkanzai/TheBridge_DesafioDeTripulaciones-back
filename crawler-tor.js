const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://ev-database.org";

const CARS_DB_URL = (i) =>
  `${BASE_URL}/compare/newest-upcoming-electric-vehicle#sort:path~type~order=.id~number~desc|range-slider-range:prev~next=0~1200|range-slider-acceleration:prev~next=2~23|range-slider-topspeed:prev~next=110~450|range-slider-battery:prev~next=10~200|range-slider-eff:prev~next=100~300|range-slider-fastcharge:prev~next=0~1500|paging:currentPage=${i}|paging:number=9`;

const rnd = (arr) => Math.floor(Math.random() * arr.length);

const checkIfFileExists = (page) => {
  try {
    fs.readFileSync(path.join(__dirname, `./scrap/cars-${page}.json`));
    return true;
  } catch (error) {
    return false;
  }
};

async function scrapeTotalNumber() {
  const browser = await puppeteer.launch({
    args: ["--proxy-servers=socks5://127.0.0.1:9050"],
  });

  const page = await browser.newPage();
  await page.goto(CARS_DB_URL(0));
  const content = await page.content();

  const $ = cheerio.load(content);

  browser.close();

  const totalCars = $("div.jplist-label").text().split(" ")[7];
  return Math.ceil(totalCars / 9);
}

async function scrapeHome(i) {
  const browser = await puppeteer.launch({
    args: [`--proxy-server=socks5://127.0.0.1:9050`],
  });

  const page = await browser.newPage();
  await page.goto(CARS_DB_URL(i));
  const content = await page.content();

  const $ = cheerio.load(content);

  const cars = [];

  $("div.list-item").each((i, el) => {
    const carName = $(el)
      .children("div.data-wrapper")
      .children("div.title-wrap")
      .children("h2")
      .text();

    const carUrl = $(el)
      .children("div.data-wrapper")
      .children("div.title-wrap")
      .children("h2")
      .children("a")
      .attr("href");

    const available = $(el)
      .children("div.data-wrapper")
      .children("div.title-wrap")
      .children("span.not-current")
      .text()
      ? false
      : true;

    const releaseDate = new Date(
      $(el)
        .children("div.data-wrapper")
        .children("div.title-wrap")
        .children("span.date_from")
        .text() * 1000
    );

    cars.push({ carName, carUrl, available, releaseDate });
  });

  browser.close();

  return cars;
}

async function scrapeUrl(port, url) {
  const browser = await puppeteer.launch({
    args: [`--proxy-server=https=socks5://127.0.0.1:${port}`],
  });

  const page = await browser.newPage();
  await page.goto(`${BASE_URL}${url}`);
  const content = await page.content();

  const $ = cheerio.load(content);

  const carName = $(".content")
    .children("header.sub-header")
    .children("h1")
    .text();

  const rangeTableData = $(".content #main-data #range table tbody").children(
    "tr"
  );

  const rangeData = {};

  rangeTableData.each((i, ch) => {
    const title = $(ch).children("td").first().text();
    const value = $(ch).children("td").last().text();

    rangeData[title] = value;
  });

  const performanceTableData = $(
    ".content #main-data #performance table tbody"
  ).children("tr");

  const performanceData = {};

  performanceTableData.each((i, ch) => {
    const title = $(ch).children("td").first().text();
    const value = $(ch).children("td").last().text();

    performanceData[title] = value;
  });

  const chargingTableData = $(
    ".content #main-data #charging table tbody"
  ).children("tr");

  const chargingData = {};

  chargingTableData.each((i, ch) => {
    const title = $(ch).children("td").first().text();
    const value = $(ch).children("td").last().text();

    chargingData[title] = value;
  });

  const efficiencyTableData = $(
    ".content #main-data #efficiency table tbody"
  ).children("tr");

  const efficiencyData = {};

  efficiencyTableData.each((i, ch) => {
    const title = $(ch).children("td").first().text();
    const value = $(ch).children("td").last().text();

    efficiencyData[title] = value;
  });

  const realConsumptionTableData = $(
    ".content #main-data #real-consumption table tbody"
  ).children("tr");

  const realConsumptionData = {};

  realConsumptionTableData.each((i, ch) => {
    const title = $(ch).children("td").first().text();
    const value = $(ch).children("td").last().text();

    realConsumptionData[title] = value;
  });

  const dimensionsTableData = $(
    ".content #main-data .data-table:nth-last-child(3) table tbody"
  ).children("tr");

  const dimensionsData = {};

  dimensionsTableData.each((i, ch) => {
    const title = $(ch).children("td").first().text();
    const value = $(ch).children("td").last().text();

    dimensionsData[title] = value;
  });

  const miscellaneousTableData = $(
    ".content #main-data .data-table:nth-last-child(2) table tbody"
  ).children("tr");

  const miscellaneousData = {};

  miscellaneousTableData.each((i, ch) => {
    const title = $(ch).children("td").first().text();
    const value = $(ch).children("td").last().text();

    miscellaneousData[title] = value;
  });

  browser.close();

  return {
    carName,
    rangeData,
    performanceData,
    chargingData,
    efficiencyData,
    realConsumptionData,
    dimensionsData,
    miscellaneousData,
  };
}

async function main() {
  const ports = ["9050", "9051", "9052", "9053", "9054"];

  const numberOfPages = await scrapeTotalNumber();

  for (const page of Array.from({ length: numberOfPages }, (_, i) => i)) {
    if (checkIfFileExists(page)) continue;

    const carsToScrape = await scrapeHome(page);

    const cars = [];

    const failedCars = [];

    for (const car of carsToScrape) {
      try {
        const newCar = await scrapeUrl(ports[rnd(ports)], car.carUrl);
        // console.log(newCar);
        cars.push({
          ...newCar,
          available: car.available,
          releaseDate: car.releaseDate,
        });
      } catch (error) {
        failedCars.push(car);
        console.error(error.message);
      }
    }

    for (const car of failedCars) {
      try {
        const newCar = await scrapeUrl(ports[rnd(ports)], car.carUrl);
        // console.log(newCar);
        cars.push({
          ...newCar,
          available: car.available,
          releaseDate: car.releaseDate,
        });
      } catch (error) {
        failedCars.push(car);
        console.error(error.message);
      }
    }

    await fs.writeFileSync(
      path.join(__dirname, `scrap/cars-${page}.json`),
      JSON.stringify(cars, null, 2)
    );

    console.info(`cars for page ${page} crawled and saved`);
  }
}

main();
