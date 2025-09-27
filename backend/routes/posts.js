// backend/routes/posts.js
const express = require('express');
const router = express.Router();
const Tutorial = require('../models/Tutorial'); 
const Comment = require('../models/Comment'); // ¡IMPORTA EL MODELO DE COMENTARIOS!
const authMiddleware = require('../middleware/authMiddleware'); 
const authorizeRoles = require('../middleware/roleMiddleware'); 

// ================================================================
// RUTA PARA CREAR UN NUEVO TUTORIAL (POST) - Sin cambios
// ================================================================
router.post('/', authMiddleware, authorizeRoles('admin'), async (req, res) => {
    const { slug, path, title, category, description, views } = req.body;
    const authorName = req.user.username || req.user.email || 'Autor Desconocido'; 

    if (!slug || !path || !title || !category || !description) {
        return res.status(400).json({ message: 'Todos los campos principales (slug, path, title, category, description) son requeridos.' });
    }

    try {
        const newTutorial = new Tutorial({
            slug,
            path,
            title,
            category,
            description,
            views: views || 0, 
            author: authorName 
        });
        const savedTutorial = await newTutorial.save();
        res.status(201).json({
            message: 'Tutorial creado exitosamente.',
            tutorial: savedTutorial
        });
    } catch (error) {
        console.error('Error al crear el tutorial:', error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Ya existe un tutorial con este slug o path.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear el tutorial.' });
    }
});

// ================================================================
// RUTA PARA OBTENER TODOS LOS TUTORIALES (GET)
// ¡MODIFICADA para incluir el conteo de comentarios!
// ================================================================
router.get('/', async (req, res) => {
    try {
        let tutorials = await Tutorial.find({}); // Encuentra todos los tutoriales

        // Para cada tutorial, obtener el conteo de comentarios
        const tutorialsWithCommentCount = await Promise.all(tutorials.map(async (tutorial) => {
            const commentCount = await Comment.countDocuments({ articleId: tutorial._id });
            return {
                ...tutorial.toObject(), // Convierte el documento Mongoose a un objeto JavaScript plano
                commentCount: commentCount // Añade el conteo de comentarios
            };
        }));

        res.status(200).json(tutorialsWithCommentCount); // Devuelve la lista de tutoriales con el conteo
    } catch (error) {
        console.error('Error al obtener los tutoriales con conteo de comentarios:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener los tutoriales.' });
    }
});

module.exports = router;
