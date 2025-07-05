// backend/routes/posts.js
const express = require('express');
const router = express.Router();
const Tutorial = require('../models/Tutorial'); // Asegúrate de importar tu modelo Tutorial

// Ruta para obtener todos los posts/tutoriales desde la base de datos
// Esta ruta responderá a las peticiones GET a /api/posts
router.get('/', async (req, res) => {
    try {
        // Encuentra todos los tutoriales en la base de datos
        // Asegúrate de que tu modelo Tutorial (backend/models/Tutorial.js)
        // tiene los campos: _id, title, slug, category, description, views, createdAt
        const tutorials = await Tutorial.find({});
        console.log('API /api/posts: Devolviendo', tutorials.length, 'tutoriales desde la DB.');
        res.status(200).json(tutorials);
    } catch (error) {
        console.error('Error al obtener los posts desde la DB:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener los posts.' });
    }
});

module.exports = router;
