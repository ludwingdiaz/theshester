// backend/routes/views.js
const express = require('express');
const router = express.Router();
const Tutorial = require('../models/Tutorial'); // Importa el modelo Tutorial

// Ruta para obtener las vistas de un tutorial y/o incrementarlas
router.post('/', async (req, res) => {
    const { tutorialPath } = req.body;

    if (!tutorialPath) {
        return res.status(400).json({ message: 'tutorialPath es requerido' });
    }

    try {
        const tutorial = await Tutorial.findOneAndUpdate(
            { path: tutorialPath },
            { $inc: { views: 1 } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({
            path: tutorial.path,
            views: tutorial.views,
            message: 'Vistas actualizadas exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar las vistas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Opcional: Ruta para obtener todas las vistas
router.get('/', async (req, res) => {
    try {
        const tutorials = await Tutorial.find({});
        res.status(200).json(tutorials);
    } catch (error) {
        console.error('Error al obtener todas las vistas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;