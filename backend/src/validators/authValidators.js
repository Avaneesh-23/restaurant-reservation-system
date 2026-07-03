const { body, query } = require('express-validator');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const reservationValidation = [
  body('date').notEmpty().withMessage('Reservation date is required'),
  body('timeSlot')
    .isIn(['12:00', '13:00', '14:00', '18:00', '19:00', '20:00', '21:00'])
    .withMessage('Invalid time slot'),
  body('guestCount').isInt({ min: 1, max: 20 }).withMessage('Guest count must be between 1 and 20'),
  body('tableId').optional().isMongoId().withMessage('Invalid table ID'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes too long'),
];

const updateReservationValidation = [
  body('date').optional().notEmpty().withMessage('Reservation date cannot be empty'),
  body('timeSlot')
    .optional()
    .isIn(['12:00', '13:00', '14:00', '18:00', '19:00', '20:00', '21:00'])
    .withMessage('Invalid time slot'),
  body('guestCount')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Guest count must be between 1 and 20'),
  body('tableId').optional().isMongoId().withMessage('Invalid table ID'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes too long'),
];

const availabilityQueryValidation = [
  query('date').notEmpty().withMessage('date query param is required'),
  query('timeSlot')
    .isIn(['12:00', '13:00', '14:00', '18:00', '19:00', '20:00', '21:00'])
    .withMessage('Invalid time slot'),
  query('guestCount')
    .isInt({ min: 1, max: 20 })
    .withMessage('guestCount must be between 1 and 20'),
];

const tableValidation = [
  body('tableNumber').isInt({ min: 1 }).withMessage('Table number must be a positive integer'),
  body('capacity').isInt({ min: 1, max: 20 }).withMessage('Capacity must be between 1 and 20'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

const updateTableValidation = [
  body('tableNumber')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Table number must be a positive integer'),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Capacity must be between 1 and 20'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

module.exports = {
  registerValidation,
  loginValidation,
  reservationValidation,
  updateReservationValidation,
  availabilityQueryValidation,
  tableValidation,
  updateTableValidation,
};
