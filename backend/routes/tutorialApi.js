// backend/routes/tutorialApi.js
const express = require('express');
const router = express.Router();
const Tutorial = require('../models/Tutorial');

// Objeto para almacenar la última vez que se procesó una solicitud de incremento por articleId.
// Esto es una solución en memoria. Para producción con múltiples instancias, se necesitaría un caché distribuido (ej. Redis).
const lastIncrementTimes = {};
// Tiempo de debounce en milisegundos (1.5 segundos)
const DEBOUNCE_TIME_MS = 1500; 

// Ruta para incrementar las vistas de un artículo
router.post('/article/:articleId/increment', async (req, res) => {
    const { articleId } = req.params;
    const currentTime = Date.now();

    // Comprobación de debounce
    // Si ya hay un registro y la diferencia de tiempo es menor que DEBOUNCE_TIME_MS
    if (lastIncrementTimes[articleId] && (currentTime - lastIncrementTimes[articleId] < DEBOUNCE_TIME_MS)) {
        // Opcional: Puedes loggear aquí para saber que se ignoró una solicitud en producción,
        // pero con console.warn para que no sea un error fatal.
        // console.warn(`Solicitud de incremento para ID: ${articleId} ignorada debido a debounce.`);
        return res.status(429).json({ message: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.' });
    }

    // Importante: Actualizar el tiempo de la última solicitud procesada *antes* de la operación de base de datos.
    // Esto asegura que la siguiente solicitud (si llega rápidamente) sea detectada por el debounce.
    lastIncrementTimes[articleId] = currentTime;

    try {
        const updatedTutorial = await Tutorial.findOneAndUpdate(
            { _id: articleId },
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!updatedTutorial) {
            console.warn(`Intento de incrementar vista para ID no encontrado: ${articleId}`); // Mantener este warning
            return res.status(404).json({ message: 'Tutorial no encontrado.' });
        }

        // Puedes mantener este log en producción si quieres ver los incrementos en tiempo real
        console.log(`Vista incrementada para el artículo ${articleId}. Total vistas: ${updatedTutorial.views}`); 
        res.status(200).json({
            message: 'Vista registrada con éxito.',
            views: updatedTutorial.views
        });

    } catch (error) {
        console.error('Error al incrementar la vista del artículo:', error); // Mantener este error
        res.status(500).json({ message: 'Error interno del servidor al registrar la vista.' });
    }
});

// Ruta opcional para obtener las vistas de un artículo específico por su ID
// (Asumo que esta parte ya estaba en tu archivo y no necesita cambios, la mantengo por completitud)
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
