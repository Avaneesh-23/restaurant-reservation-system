const express = require('express');
const { getTables, createTable, updateTable, deleteTable } = require('../controllers/tableController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { tableValidation, updateTableValidation } = require('../validators/authValidators');

const router = express.Router();

router.get('/', getTables);

router.use(protect, authorize('admin'));

router.post('/', tableValidation, validate, createTable);
router.patch('/:id', updateTableValidation, validate, updateTable);
router.delete('/:id', deleteTable);

module.exports = router;
