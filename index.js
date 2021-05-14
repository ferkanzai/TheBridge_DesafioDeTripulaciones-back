const info = require("./scrap/charge-points.json");

console.log(info.features.length);

info.features.forEach((feat) => {
  if (feat.properties.poi.operatorInfo)
    console.log(feat.properties.poi.operatorInfo.title);
});
