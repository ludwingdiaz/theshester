// backend/routes/posts.js
const express = require('express');
const router = express.Router();
const Tutorial = require('../models/Tutorial'); // Asegúrate de que esta ruta sea correcta para tu modelo Tutorial
const authMiddleware = require('../middleware/authMiddleware'); // Necesario para proteger la ruta
const authorizeRoles = require('../middleware/roleMiddleware'); // Necesario para proteger la ruta por rol

// ================================================================
// RUTA PARA CREAR UN NUEVO TUTORIAL (POST)
// Protegida: Solo usuarios autenticados y con rol 'admin' pueden crear posts
// ================================================================
router.post('/', authMiddleware, authorizeRoles('admin'), async (req, res) => {
    // Extrae los datos del cuerpo de la petición.
    // ¡Ya NO extraemos 'author' de req.body, se tomará del token!
    const { slug, path, title, category, description, views } = req.body;

    // El nombre del autor se toma directamente del usuario autenticado
    // Asegúrate de que tu authMiddleware adjunte req.user.username
    const authorName = req.user.username || req.user.email || 'Autor Desconocido'; // Fallback por si acaso

    // Validación básica de los datos recibidos (sin 'author' en el body)
    if (!slug || !path || !title || !category || !description) {
        return res.status(400).json({ message: 'Todos los campos principales (slug, path, title, category, description) son requeridos.' });
    }

    try {
        // Crea una nueva instancia del modelo Tutorial
        // Se ha eliminado la duplicación de la declaración de newTutorial
        const newTutorial = new Tutorial({
            slug,
            path,
            title,
            category,
            description,
            views: views || 0, // Asegura que 'views' se inicialice en 0 si no se proporciona
            author: authorName // ¡Asigna el nombre del autor desde el token!
            // Mongoose añadirá automáticamente 'createdAt' y 'updatedAt' debido a 'timestamps: true'
        });

        // Guarda el documento en la base de datos
        const savedTutorial = await newTutorial.save();

        res.status(201).json({
            message: 'Tutorial creado exitosamente.',
            tutorial: savedTutorial // Devuelve el tutorial completo guardado (con _id, fechas y autor)
        });

    } catch (error) {
        console.error('Error al crear el tutorial:', error);
        // Manejo de error de clave duplicada (slug o path únicos)
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Ya existe un tutorial con este slug o path.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear el tutorial.' });
    }
});

// ================================================================
// RUTA PARA OBTENER TODOS LOS TUTORIALES (GET)
// Esta es la ruta que tu frontend usa para listar los tutoriales.
// ================================================================
router.get('/', async (req, res) => {
    try {
        const tutorials = await Tutorial.find({}); // Encuentra todos los tutoriales
        res.status(200).json(tutorials); // Devuelve la lista de tutoriales
    } catch (error) {
        console.error('Error al obtener los tutoriales:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener los tutoriales.' });
    }
});

module.exports = router;
