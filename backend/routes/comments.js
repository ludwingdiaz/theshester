// backend/routes/comments.js
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment'); // Importa el modelo Comment

// --- Middleware de Validación para Comentarios ---
const validateComment = (req, res, next) => {
    const { articleSlug, author, commentText } = req.body;

    // Verificación básica de que los campos requeridos existen y no están vacíos
    if (!articleSlug || articleSlug.trim() === '') {
        return res.status(400).json({ message: 'El slug del artículo es requerido.' });
    }
    if (!author || author.trim() === '') {
        return res.status(400).json({ message: 'El nombre del autor es requerido.' });
    }
    if (!commentText || commentText.trim() === '') {
        return res.status(400).json({ message: 'El texto del comentario es requerido.' });
    }
    if (commentText.length > 500) { // Ejemplo: Limitar longitud del comentario
        return res.status(400).json({ message: 'El comentario no puede exceder los 500 caracteres.' });
    }

    // Si todo es válido, pasa al siguiente middleware o manejador de ruta
    next();
};

// --- Rutas de Comentarios ---

// 1. Ruta para obtener comentarios de un tutorial específico
// URL esperada: /api/comments?articleSlug=nombre-del-articulo
router.get('/', async (req, res) => {
    const { articleSlug } = req.query;

    if (!articleSlug) {
        return res.status(400).json({ message: 'articleSlug es requerido para obtener comentarios.' });
    }

    try {
        // Encontrar todos los comentarios para el articleSlug dado
        // Filtrar por 'approved: true' si quieres moderar
        // Ordenar por fecha de creación (1 para ascendente, -1 para descendente)
        const comments = await Comment.find({ articleSlug: articleSlug, approved: true }).sort({ timestamp: 1 });
        res.status(200).json(comments);

    } catch (error) {
        console.error('Error al obtener comentarios:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener comentarios.' });
    }
});

// 2. Ruta para agregar un nuevo comentario
// URL esperada: /api/comments (POST)
// Usa el middleware de validación antes de procesar la solicitud
router.post('/', validateComment, async (req, res) => {
    const { articleSlug, author, commentText } = req.body;

    try {
        const newComment = new Comment({
            articleSlug,
            author,
            commentText,
            // timestamp y approved se establecen por defecto en el esquema
        });

        await newComment.save(); // Guarda el nuevo comentario en la base de datos

        res.status(201).json({ message: 'Comentario agregado exitosamente', comment: newComment });

    } catch (error) {
        console.error('Error al agregar comentario:', error);
        // Manejar errores de validación de Mongoose si los hay (ej. longitud mínima)
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al agregar comentario.' });
    }
});

module.exports = router;