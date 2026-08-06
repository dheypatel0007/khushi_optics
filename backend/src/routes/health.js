const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'UP',
    system: 'KHUSHI OPTICS REST API Server',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
