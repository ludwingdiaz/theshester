// backend/routes/comments.js
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta para AÑADIR un comentario a un artículo específico (PROTEGIDA)
router.post('/article/:articleId', authMiddleware, async (req, res) => {
    const { articleId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;
    const username = req.user.username;

    if (!text || text.trim() === '') {
        return res.status(400).json({ message: 'El comentario no puede estar vacío.' });
    }

    try {
        const newComment = new Comment({
            text,
            user: userId,
            username,
            articleId
        });
        await newComment.save();
        res.status(201).json({ message: 'Comentario publicado con éxito.', comment: newComment });
    } catch (error) {
        console.error('Error al publicar comentario:', error);
        res.status(500).json({ message: 'Error del servidor al publicar comentario.' });
    }
});

// Ruta para OBTENER comentarios de un artículo específico (PÚBLICA)
router.get('/article/:articleId', async (req, res) => {
    const { articleId } = req.params;
    try {
        const comments = await Comment.find({ articleId })
                                    .sort({ createdAt: -1 });
        res.status(200).json({ comments });
    } catch (error) {
        console.error('Error al obtener comentarios del artículo:', error);
        res.status(500).json({ message: 'Error del servidor al obtener comentarios del artículo.' });
    }
});

// Ruta para OBTENER TODOS los comentarios del USUARIO logueado (PROTEGIDA - para el dashboard)
router.get('/my-comments', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    try {
        const comments = await Comment.find({ user: userId })
                                    .sort({ createdAt: -1 });
        res.status(200).json({ comments });
    } catch (error) {
        console.error('Error al obtener los comentarios del usuario:', error);
        res.status(500).json({ message: 'Error del servidor al obtener tus comentarios.' });
    }
});

// Ruta: Obtener comentarios de UN USUARIO ESPECÍFICO por su ID (PROTEGIDA)
router.get('/user/:userId', authMiddleware, async (req, res) => {
    const { userId } = req.params;

    // Logs de depuración
    console.log('--- Depuración de /api/comments/user/:userId ---');
    console.log('req.user.id (del token autenticado):', req.user.id);
    console.log('userId (de la URL - req.params):', userId);
    console.log('req.user.role:', req.user.role);
    console.log('Límite solicitado (req.query.limit):', req.query.limit);
    
    const limit = req.query.limit ? parseInt(req.query.limit) : 0;
    console.log('Límite PARSEADO (variable "limit"):', limit);

    if (req.user.id !== userId && req.user.role !== 'admin') {
         console.log('Acceso denegado: ID de usuario no coincide y no es admin.');
         return res.status(403).json({ message: 'No tienes permiso para ver los comentarios de este usuario.' });
    }

    try {
        let query = Comment.find({ user: userId }).sort({ createdAt: -1 });

        if (limit > 0) {
            query = query.limit(limit);
        }

        const comments = await query.exec();
        console.log('Número de comentarios encontrados para este usuario con/sin límite:', comments.length);
        console.log('Primeros 3 comentarios encontrados (para inspección):', comments.slice(0, 3));

        res.status(200).json({ comments });
    } catch (error) {
        console.error(`Error al obtener comentarios del usuario ${userId}:`, error);
        res.status(500).json({ message: 'Error del servidor al obtener los comentarios del usuario.' });
    }
});

// ================================================================
// NUEVA RUTA: Obtener resumen de estadísticas del usuario (PROTEGIDA)
// Ruta: /api/comments/user-summary
// ================================================================
router.get('/user-summary', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // ID del usuario autenticado desde el token

        // 1. Contar comentarios publicados
        const commentsCount = await Comment.countDocuments({ user: userId });

        // 2. Obtener la última actividad (fecha del último comentario)
        const latestComment = await Comment.findOne({ user: userId })
                                            .sort({ createdAt: -1 }) // Ordena por fecha de creación descendente
                                            .limit(1); // Obtiene solo el más reciente
        const lastActivity = latestComment ? latestComment.createdAt : null;

        // 3. Contar artículos únicos comentados (como proxy de "Artículos Vistos")
        const distinctArticlesCommented = await Comment.distinct('articleId', { user: userId });
        const articlesViewed = distinctArticlesCommented.length; 

        res.status(200).json({
            commentsPublished: commentsCount,
            lastActivity: lastActivity, 
            articlesViewed: articlesViewed
        });

    } catch (error) {
        console.error('Error al obtener el resumen de estadísticas del usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener las estadísticas.' });
    }
});

console.log('Router de comentarios cargado y rutas definidas.');

module.exports = router;
