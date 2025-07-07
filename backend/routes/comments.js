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
router.get('/article/:articleId', async (req, res) => { // ¡ESTA ES LA RUTA QUE NECESITA ESTAR COMPLETA!
    const { articleId } = req.params;
    try {
        const comments = await Comment.find({ articleId })
                                    .sort({ createdAt: -1 }); // Ordena por los más recientes primero
        res.status(200).json({ comments });
    } catch (error) {
        console.error('Error al obtener comentarios del artículo:', error);
        res.status(500).json({ message: 'Error del servidor al obtener comentarios del artículo.' });
    }
});

// Ruta para OBTENER TODOS los comentarios del USUARIO logueado (PROTEGIDA - para el dashboard)
router.get('/my-comments', authMiddleware, async (req, res) => { // ¡ESTA RUTA TAMBIÉN NECESITA ESTAR COMPLETA!
    const userId = req.user.id;
    try {
        const comments = await Comment.find({ user: userId })
                                    .sort({ createdAt: -1 }); // Los más recientes primero
        res.status(200).json({ comments });
    } catch (error) {
        console.error('Error al obtener los comentarios del usuario:', error);
        res.status(500).json({ message: 'Error del servidor al obtener tus comentarios.' });
    }
});

// NUEVA RUTA: Obtener comentarios de UN USUARIO ESPECÍFICO por su ID (PROTEGIDA)
router.get('/user/:userId', authMiddleware, async (req, res) => {
    const { userId } = req.params; // Captura el userId de la URL

    // --- AÑADE ESTOS CONSOLE.LOGS ---
    console.log('--- Depuración de /api/comments/user/:userId ---');
    console.log('req.user.id (del token autenticado):', req.user.id);
    console.log('userId (de la URL - req.params):', userId);
    console.log('req.user.role:', req.user.role);
    // --- FIN DE CONSOLE.LOGS ---

    if (req.user.id !== userId && req.user.role !== 'admin') {
         console.log('Acceso denegado: ID de usuario no coincide y no es admin.'); // Log adicional
         return res.status(403).json({ message: 'No tienes permiso para ver los comentarios de este usuario.' });
    }

    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 0;
        let query = Comment.find({ user: userId }).sort({ createdAt: -1 });

        if (limit > 0) {
            query = query.limit(limit);
        }

        const comments = await query.exec();

        res.status(200).json({ comments });
    } catch (error) {
        console.error(`Error al obtener comentarios del usuario ${userId}:`, error);
        res.status(500).json({ message: 'Error del servidor al obtener los comentarios del usuario.' });
    }
});
console.log('Router de comentarios cargado y rutas definidas.');

module.exports = router;