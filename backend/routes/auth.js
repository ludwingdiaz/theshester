// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');     
const jwt = require('jsonwebtoken');    

// --- Middleware de Validación para Registro (sin cambios) ---
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
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        return res.status(400).json({ message: 'La contraseña debe incluir mayúsculas, minúsculas y números.' });
    }

    next(); 
};

// --- Ruta de Registro de Usuarios (sin cambios) ---
router.post('/register', validateRegister, async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(409).json({ message: 'El nombre de usuario o el correo electrónico ya están en uso.' });
        }

        const newUser = new User({ username, email, password }); 
        await newUser.save();

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
        if (error.name === 'MongoServerError' && error.code === 11000) {
             return res.status(409).json({ message: 'El nombre de usuario o el correo electrónico ya están en uso.' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al registrar usuario.' });
    }
});


// --- RUTA DE LOGIN (¡Esta es la versión correcta y final!) ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        const payload = {
            user: {
                id: user.id, 
                username: user.username,
                email: user.email,
                role: user.role 
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Usa el secreto del .env
            { expiresIn: '1h' }, 
            (err, token) => {
                if (err) {
                    console.error('Error al firmar el token JWT:', err); 
                    return res.status(500).json({ message: 'Error interno del servidor al generar el token.' });
                }
                res.json({
                    token, 
                    message: 'Inicio de sesión exitoso.',
                    user: { 
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.' });
    }
});

module.exports = router;