const Table = require('../models/Table');
const Reservation = require('../models/Reservation');
const AppError = require('../utils/AppError');

const getTables = async (req, res, next) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json({ success: true, count: tables.length, data: tables });
  } catch (error) {
    next(error);
  }
};

const createTable = async (req, res, next) => {
  try {
    const table = await Table.create(req.body);
    res.status(201).json({ success: true, data: table });
  } catch (error) {
    next(error);
  }
};

const updateTable = async (req, res, next) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!table) {
      throw new AppError('Table not found.', 404);
    }

    res.json({ success: true, data: table });
  } catch (error) {
    next(error);
  }
};

const deleteTable = async (req, res, next) => {
  try {
    const activeReservation = await Reservation.findOne({
      table: req.params.id,
      status: 'confirmed',
      date: { $gte: new Date(new Date().setUTCHours(0, 0, 0, 0)) },
    });

    if (activeReservation) {
      throw new AppError('Cannot delete a table with upcoming confirmed reservations.', 409);
    }

    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) {
      throw new AppError('Table not found.', 404);
    }

    res.json({ success: true, message: 'Table deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTables, createTable, updateTable, deleteTable };
