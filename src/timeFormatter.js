const smallDays = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];

export const smallDayMonthDateFullTime = (start, end) => {
  const month = start.getMonth();
  const day = smallDays[start.getDay()];
  const date = start.getDate();

  const time = fullTime(start, end);

  return day + " " + month + "/" + date + ", " + time;
};

export const fullTime = (start, end) => {
  const firstTime = `${
    start.getHours() % 12 === 0 ? 12 : start.getHours() % 12
  }${
    start.getMinutes() === 0
      ? ""
      : `:${
          start.getMinutes() < 10
            ? `0${start.getMinutes()}`
            : start.getMinutes()
        }`
  }${start.getHours() > 11 ? "PM" : "AM"}`;
  const endTime = `${end.getHours() % 12 === 0 ? 12 : end.getHours() % 12}${
    end.getMinutes() === 0
      ? ""
      : `:${end.getMinutes() < 10 ? `0${end.getMinutes()}` : end.getMinutes()}`
  }${end.getHours() > 11 ? "PM" : "AM"}`;
  const time = `${firstTime} - ${endTime}`;

  return time;
};

export const smallDayMonthDate = start => {
  const month = start.getMonth();
  const day = smallDays[start.getDay()];
  const date = start.getDate();

  return day + " " + month + "/" + date;
};
