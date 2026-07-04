const express = require('express');
const router = express.Router();
const seed = require('../seed/seed');

// POST /api/seed - Trigger database seeding
router.post('/', async (req, res) => {
  try {
    console.log('Seed endpoint called');
    await seed(false);
    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seed endpoint error:', error);
    res.status(500).json({ success: false, message: 'Seeding failed', error: error.message });
  }
});

module.exports = router;
