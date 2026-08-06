const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Frames
router.get('/frames', productController.getFrames);
router.post('/frames', productController.createFrame);
router.put('/frames/:id', productController.updateFrame);
router.delete('/frames/:id', productController.deleteFrame);

// Lenses
router.get('/lenses', productController.getLenses);
router.post('/lenses', productController.createLens);
router.put('/lenses/:id', productController.updateLens);
router.delete('/lenses/:id', productController.deleteLens);

module.exports = router;
