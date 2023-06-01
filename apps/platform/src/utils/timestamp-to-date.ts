export function timestampToDate(timestampInSeconds: string, extended = false) {
  const timestampInMilliseconds = parseInt(timestampInSeconds) * 1000;
  const dateObj = new Date(timestampInMilliseconds);

  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();

  let hour = dateObj.getHours().toString();
  if (hour.length != 2) hour = "0" + hour;
  let minute = dateObj.getMinutes().toString();
  if (minute.length != 2) minute = "0" + minute;

  return `${day}-${month}-${year}` + (extended ? ` ${hour}:${minute}` : "");
}
