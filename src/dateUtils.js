const {formatToTimeZone} = require("date-fns-timezone")


const getUTCTimeStamp = () => {
  const pattern = "YYYY-MM-DDTHH:mm:ss.SSSZ";
  const date = new Date();
  return formatToTimeZone(date, pattern, {timeZone: "UTC"});
};

module.exports = {getUTCTimeStamp}

