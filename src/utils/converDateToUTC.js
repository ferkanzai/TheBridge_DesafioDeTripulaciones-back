const convertDateToUTC = (date) => {
  const new_date = new Date(date);
  const new_date_UTC = new Date(
    new_date.getTime() - new_date.getTimezoneOffset() * 60 * 1000
  ).toUTCString();

  return new_date_UTC;
};

module.exports = { convertDateToUTC };
