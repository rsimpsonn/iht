const smallDays = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];

export const smallDayMonthDateFullTime = (start, end) => {
  const month = start.getMonth();
  const day = smallDays[start.getDay()];
  const date = start.getDate();

  const time =
    (start.getHours() % 12 === 0 ? 12 : start.getHours() % 12) +
    (start.getHours() > 11 ? "PM" : "AM") +
    " - " +
    (end.getHours() % 12 == 0 ? 12 : end.getHours() % 12) +
    (end.getHours() > 11 ? "PM" : "AM");

  return day + " " + month + "/" + date + ", " + time;
};

export const fullTime = (start, end) => {
  const time =
    (start.getHours() % 12 === 0 ? 12 : start.getHours() % 12) +
    (start.getHours() > 11 ? "PM" : "AM") +
    " - " +
    (end.getHours() % 12 == 0 ? 12 : end.getHours() % 12) +
    (end.getHours() > 11 ? "PM" : "AM");

  return time;
};

export const smallDayMonthDate = start => {
  const month = start.getMonth();
  const day = smallDays[start.getDay()];
  const date = start.getDate();

  return day + " " + month + "/" + date;
};
