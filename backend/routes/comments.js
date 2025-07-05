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


console.log('Router de comentarios cargado y rutas definidas.');

module.exports = router;