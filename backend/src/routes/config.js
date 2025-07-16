const express = require('express');
const router = express.Router();

// Global configuration routes (placeholder for future implementation)
router.get('/global', (req, res) => {
  res.json({
    success: true,
    message: 'Global configuration endpoint - not yet implemented',
    data: {}
  });
});

router.put('/global', (req, res) => {
  res.json({
    success: true,
    message: 'Global configuration update endpoint - not yet implemented',
    data: {}
  });
});

module.exports = router;
