const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const AppError = require('../utils/AppError');
const {
  normalizeDate,
  isPastDate,
  isToday,
  isPastTimeSlot,
  TIME_SLOTS,
} = require('../utils/reservationHelpers');

const getBookedTableIds = async (date, timeSlot, excludeReservationId = null) => {
  const query = {
    date,
    timeSlot,
    status: 'confirmed',
  };

  if (excludeReservationId) {
    query._id = { $ne: excludeReservationId };
  }

  const reservations = await Reservation.find(query).select('table');
  return reservations.map((r) => r.table.toString());
};

const findAvailableTables = async (date, timeSlot, guestCount, excludeReservationId = null) => {
  const bookedTableIds = await getBookedTableIds(date, timeSlot, excludeReservationId);

  const tables = await Table.find({
    isActive: true,
    capacity: { $gte: guestCount },
    _id: { $nin: bookedTableIds },
  }).sort({ capacity: 1, tableNumber: 1 });

  return tables;
};

const validateReservationInput = ({ date, timeSlot, guestCount }) => {
  const normalizedDate = normalizeDate(date);
  if (!normalizedDate) {
    throw new AppError('Invalid reservation date.', 400);
  }

  if (isPastDate(normalizedDate)) {
    throw new AppError('Cannot book a reservation in the past.', 400);
  }

  if (!TIME_SLOTS.includes(timeSlot)) {
    throw new AppError(`Invalid time slot. Available slots: ${TIME_SLOTS.join(', ')}`, 400);
  }

  if (isToday(normalizedDate) && isPastTimeSlot(timeSlot)) {
    throw new AppError('Cannot book a time slot that has already passed.', 400);
  }

  if (!guestCount || guestCount < 1) {
    throw new AppError('Guest count must be at least 1.', 400);
  }

  return normalizedDate;
};

const assignTable = async ({ date, timeSlot, guestCount, tableId, excludeReservationId }) => {
  const availableTables = await findAvailableTables(
    date,
    timeSlot,
    guestCount,
    excludeReservationId
  );

  if (availableTables.length === 0) {
    throw new AppError(
      'No tables available for the selected date, time, and party size.',
      409
    );
  }

  if (tableId) {
    const selected = availableTables.find((t) => t._id.toString() === tableId.toString());
    if (!selected) {
      throw new AppError(
        'Selected table is unavailable or does not meet capacity requirements.',
        409
      );
    }
    return selected;
  }

  return availableTables[0];
};

module.exports = {
  findAvailableTables,
  validateReservationInput,
  assignTable,
  getBookedTableIds,
};
