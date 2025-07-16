const express = require('express');
const router = express.Router();

// Database-specific routes (placeholder for future implementation)
router.get('/info', (req, res) => {
  res.json({
    success: true,
    message: 'Database info endpoint - not yet implemented',
    data: {}
  });
});

module.exports = router;
