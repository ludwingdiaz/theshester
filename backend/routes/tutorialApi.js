// backend/routes/tutorialApi.js
const express = require('express');
const router = express.Router();
const Tutorial = require('../models/Tutorial'); // Asegúrate de que esta ruta sea correcta para tu modelo Tutorial

// Ruta para incrementar las vistas de un artículo
// Espera el ID del artículo en la URL (ej. /api/views/article/60c72b2f9b1e8b0015a8f4c2/increment)
router.post('/article/:articleId/increment', async (req, res) => {
    const { articleId } = req.params; // Obtiene el articleId de los parámetros de la URL

    try {
        // Busca el tutorial por su _id de MongoDB y lo actualiza, incrementando el campo 'views' en 1
        // new: true devuelve el documento actualizado después de la operación
        const updatedTutorial = await Tutorial.findOneAndUpdate(
            { _id: articleId }, // Busca el documento por su _id
            { $inc: { views: 1 } }, // Incrementa el campo 'views' en 1
            { new: true } // Devuelve el documento actualizado
        );

        if (!updatedTutorial) {
            console.warn(`Intento de incrementar vista para ID no encontrado: ${articleId}`);
            return res.status(404).json({ message: 'Tutorial no encontrado.' });
        }

        console.log(`Vista incrementada para el artículo ${articleId}. Total vistas: ${updatedTutorial.views}`);
        res.status(200).json({
            message: 'Vista registrada con éxito.',
            views: updatedTutorial.views // Devuelve el nuevo número de vistas al frontend
        });

    } catch (error) {
        console.error('Error al incrementar la vista del artículo:', error);
        res.status(500).json({ message: 'Error interno del servidor al registrar la vista.' });
    }
});

// Ruta opcional para obtener las vistas de un artículo específico por su ID
router.get('/article/:articleId', async (req, res) => {
    const { articleId } = req.params;
    try {
        const tutorial = await Tutorial.findById(articleId);
        if (!tutorial) {
            return res.status(404).json({ message: 'Tutorial no encontrado.' });
        }
        res.status(200).json({
            articleId: tutorial._id,
            views: tutorial.views
        });
    } catch (error) {
        console.error('Error al obtener las vistas del artículo:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener las vistas.' });
    }
});

module.exports = router;
