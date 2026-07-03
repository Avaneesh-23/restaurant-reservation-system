const express = require('express');
const {
  getMyReservations,
  getAllReservations,
  getAvailability,
  createReservation,
  updateReservation,
  cancelReservation,
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  reservationValidation,
  updateReservationValidation,
  availabilityQueryValidation,
} = require('../validators/authValidators');

const router = express.Router();

router.use(protect);

router.get('/availability', availabilityQueryValidation, validate, getAvailability);
router.get('/mine', authorize('customer', 'admin'), getMyReservations);
router.post('/', authorize('customer', 'admin'), reservationValidation, validate, createReservation);
router.patch(
  '/:id',
  authorize('customer', 'admin'),
  updateReservationValidation,
  validate,
  updateReservation
);
router.patch('/:id/cancel', authorize('customer', 'admin'), cancelReservation);

router.get('/', authorize('admin'), getAllReservations);

module.exports = router;
