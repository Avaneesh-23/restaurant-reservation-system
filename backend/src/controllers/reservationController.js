const Reservation = require('../models/Reservation');
const AppError = require('../utils/AppError');
const {
  validateReservationInput,
  assignTable,
  findAvailableTables,
} = require('../services/availabilityService');
const { TIME_SLOTS, normalizeDate } = require('../utils/reservationHelpers');

const populateOptions = [
  { path: 'table', select: 'tableNumber capacity' },
  { path: 'user', select: 'name email' },
];

const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate(populateOptions[0])
      .sort({ date: -1, timeSlot: 1 });

    res.json({ success: true, count: reservations.length, data: reservations });
  } catch (error) {
    next(error);
  }
};

const getAllReservations = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.date) {
      const normalized = normalizeDate(req.query.date);
      if (!normalized) {
        throw new AppError('Invalid date filter.', 400);
      }
      filter.date = normalized;
    }

    const reservations = await Reservation.find(filter)
      .populate(populateOptions)
      .sort({ date: -1, timeSlot: 1 });

    res.json({ success: true, count: reservations.length, data: reservations });
  } catch (error) {
    next(error);
  }
};

const getAvailability = async (req, res, next) => {
  try {
    const { date, timeSlot, guestCount } = req.query;

    if (!date || !timeSlot || !guestCount) {
      throw new AppError('date, timeSlot, and guestCount query params are required.', 400);
    }

    const normalizedDate = validateReservationInput({
      date,
      timeSlot,
      guestCount: Number(guestCount),
    });

    const tables = await findAvailableTables(
      normalizedDate,
      timeSlot,
      Number(guestCount)
    );

    res.json({
      success: true,
      count: tables.length,
      data: tables,
      timeSlots: TIME_SLOTS,
    });
  } catch (error) {
    next(error);
  }
};

const createReservation = async (req, res, next) => {
  try {
    const { date, timeSlot, guestCount, tableId, notes } = req.body;

    const normalizedDate = validateReservationInput({ date, timeSlot, guestCount });
    const table = await assignTable({
      date: normalizedDate,
      timeSlot,
      guestCount,
      tableId,
    });

    const reservation = await Reservation.create({
      user: req.user._id,
      table: table._id,
      date: normalizedDate,
      timeSlot,
      guestCount,
      notes,
    });

    await reservation.populate(populateOptions[0]);

    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

const updateReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      throw new AppError('Reservation not found.', 404);
    }

    const isOwner = reservation.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new AppError('You can only update your own reservations.', 403);
    }

    if (reservation.status === 'cancelled') {
      throw new AppError('Cannot update a cancelled reservation.', 400);
    }

    const date = req.body.date ?? reservation.date;
    const timeSlot = req.body.timeSlot ?? reservation.timeSlot;
    const guestCount = req.body.guestCount ?? reservation.guestCount;
    const tableId = req.body.tableId;

    const normalizedDate = validateReservationInput({ date, timeSlot, guestCount });
    const table = await assignTable({
      date: normalizedDate,
      timeSlot,
      guestCount,
      tableId: tableId || reservation.table,
      excludeReservationId: reservation._id,
    });

    reservation.date = normalizedDate;
    reservation.timeSlot = timeSlot;
    reservation.guestCount = guestCount;
    reservation.table = table._id;
    if (req.body.notes !== undefined) {
      reservation.notes = req.body.notes;
    }

    await reservation.save();
    await reservation.populate(populateOptions);

    res.json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      throw new AppError('Reservation not found.', 404);
    }

    const isOwner = reservation.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new AppError('You can only cancel your own reservations.', 403);
    }

    if (reservation.status === 'cancelled') {
      throw new AppError('Reservation is already cancelled.', 400);
    }

    reservation.status = 'cancelled';
    await reservation.save();
    await reservation.populate(populateOptions);

    res.json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyReservations,
  getAllReservations,
  getAvailability,
  createReservation,
  updateReservation,
  cancelReservation,
};
