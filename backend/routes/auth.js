// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Importa el modelo User

// --- Middleware de Validación para Registro ---
const validateRegister = (req, res, next) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son requeridos (username, email, password).' });
    }
    if (username.length < 3) {
        return res.status(400).json({ message: 'El nombre de usuario debe tener al menos 3 caracteres.' });
    }
    if (password.length < 8) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'El formato del correo electrónico no es válido.' });
    }
    // Puedes añadir más validaciones de complejidad de contraseña aquí si lo deseas
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        return res.status(400).json({ message: 'La contraseña debe incluir mayúsculas, minúsculas y números.' });
    }

    next(); // Si todas las validaciones pasan, continúa al siguiente middleware/manejador de ruta
};

// --- Ruta de Registro de Usuarios ---
router.post('/register', validateRegister, async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Verificar si el usuario o el email ya existen
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(409).json({ message: 'El nombre de usuario o el correo electrónico ya están en uso.' });
        }

        // Crear un nuevo usuario (la contraseña se hasheará automáticamente por el pre-save hook en models/User.js)
        const newUser = new User({
            username,
            email,
            password // Mongoose hasheará esto antes de guardar
        });

        await newUser.save(); // Guarda el usuario en la base de datos

        // No devolver la contraseña hasheada al frontend por seguridad
        res.status(201).json({
            message: 'Usuario registrado exitosamente. Ya puedes iniciar sesión.',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        // Manejar errores de validación de Mongoose si los hay (ej. unique: true)
        if (error.name === 'MongoServerError' && error.code === 11000) {
             return res.status(409).json({ message: 'El nombre de usuario o el correo electrónico ya están en uso.' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al registrar usuario.' });
    }
});

module.exports = router;