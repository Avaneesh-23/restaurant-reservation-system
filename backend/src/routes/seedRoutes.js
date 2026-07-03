const express = require('express');
const router = express.Router();
const seed = require('../seed/seed');

// POST /api/seed - Trigger database seeding
router.post('/', async (req, res) => {
  try {
    await seed();
    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Seeding failed', error: error.message });
  }
});

module.exports = router;
