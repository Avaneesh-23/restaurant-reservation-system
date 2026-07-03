const TIME_SLOTS = ['12:00', '13:00', '14:00', '18:00', '19:00', '20:00', '21:00'];

const normalizeDate = (dateInput) => {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const isPastDate = (date) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return date < today;
};

const isToday = (date) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return date.getTime() === today.getTime();
};

const isPastTimeSlot = (timeSlot) => {
  const now = new Date();
  const [hours, minutes] = timeSlot.split(':').map(Number);
  const slotTime = new Date();
  slotTime.setHours(hours, minutes, 0, 0);
  return slotTime <= now;
};

module.exports = {
  TIME_SLOTS,
  normalizeDate,
  isPastDate,
  isToday,
  isPastTimeSlot,
};
