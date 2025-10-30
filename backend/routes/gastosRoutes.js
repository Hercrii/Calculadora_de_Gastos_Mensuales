const express = require('express');
const router = express.Router();
const gastosController = require('../controllers/gastosController');

// Definir rutas
router.get('/', gastosController.obtenerGastos);
router.get('/:id', gastosController.obtenerGastoPorId);
router.post('/', gastosController.crearGasto);
router.put('/:id', gastosController.actualizarGasto);
router.delete('/:id', gastosController.eliminarGasto);

module.exports = router;