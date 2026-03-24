const CARACAS_OFFSET_HOURS = -4;

const toCaracasTimezone = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  return new Date(utc + (CARACAS_OFFSET_HOURS * 60 * 60000));
};

const formatDateToCaracas = (date) => {
  const caracasDate = toCaracasTimezone(date);
  if (!caracasDate) return "";
  const iso = caracasDate.toISOString();
  return iso.replace("T", " ").substring(0, 19);
};

const getPassDateByMilliseconds = (ms) => new Date(Date.now() - ms);

module.exports = {
  toCaracasTimezone,
  formatDateToCaracas,
  getPassDateByMilliseconds,
};