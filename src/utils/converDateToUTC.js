const convertDateToUTC = (date) => {
  const newDate = new Date(date);
  const newDateUTC = new Date(
    newDate.getTime() - newDate.getTimezoneOffset() * 60 * 1000
  ).toUTCString();

  return newDateUTC;
};

module.exports = { convertDateToUTC };
