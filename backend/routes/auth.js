// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');     
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware'); // Asegúrate de que esta línea esté aquí


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

// --- Ruta de Registro de Usuarios ---
router.post('/register', validateRegister, async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(409).json({ message: 'El nombre de usuario o el correo electrónico ya están en uso.' });
        }

        const newUser = new User({ username, email, password }); 
        await newUser.save(); 

        console.log('Usuario guardado exitosamente en la base de datos:', newUser._id); // Log de depuración
        
        res.status(201).json({
            message: 'Usuario registrado exitosamente. Ya puedes iniciar sesión.',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('Error al registrar el usuario (capturado en catch):', error); 
        if (error.name === 'MongoServerError' && error.code === 11000) {
             return res.status(409).json({ message: 'El nombre de usuario o el correo electrónico ya están en uso.' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al registrar usuario.' });
    }
});


// --- RUTA DE LOGIN ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log('Login Fallido: Usuario no encontrado para email:', email); // Log de depuración
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        // Logs de depuración para bcrypt.compare en login
        console.log('Depuración de Login:');
        console.log('  Email recibido:', email);
        console.log('  Contraseña recibida (texto plano):', password);
        console.log('  Hash de contraseña del usuario en DB (user.password):', user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        
        console.log('  Resultado de bcrypt.compare (isMatch):', isMatch);

        if (!isMatch) {
            console.log('Login Fallido: Contraseña no coincide para usuario:', user.username); // Log de depuración
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
            process.env.JWT_SECRET,
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
        console.error('Error al iniciar sesión (capturado en catch):', error); 
        res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.' });
    }
});

// --- RUTA DE ACTUALIZAR PERFIL ---
router.put('/profile/:userId', authMiddleware, async (req, res) => {
    const { userId } = req.params;
    const { username, currentPassword, newPassword } = req.body;

    try {
        // 1. Verificar si el usuario autenticado tiene permiso para editar este perfil
        // Asegúrate de que req.user esté definido por authMiddleware
        if (!req.user || (req.user.id !== userId && req.user.role !== 'admin')) {
            return res.status(403).json({ message: 'No tienes permiso para editar este perfil o token inválido.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // 2. Verificar la contraseña actual (¡CRÍTICO para seguridad!)
        console.log('Depuración de Contraseña Actual:');
        console.log('  Contraseña actual recibida (currentPassword):', currentPassword);
        console.log('  Hash de contraseña del usuario en DB (user.password):', user.password);
        
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        
        console.log('  Resultado de bcrypt.compare (isMatch):', isMatch);

        if (!isMatch) {
            console.log('  Error: Contraseña actual incorrecta detectada.');
            return res.status(400).json({ message: 'Contraseña actual incorrecta.' });
        }

        // 3. Actualizar el nombre de usuario si se proporcionó y es diferente
        if (username && username !== user.username) {
            const existingUserWithNewUsername = await User.findOne({ username });
            if (existingUserWithNewUsername && existingUserWithNewUsername._id.toString() !== userId) {
                return res.status(400).json({ message: 'Ese nombre de usuario ya está en uso.' });
            }
            user.username = username;
        }

        // 4. Actualizar la contraseña si se proporcionó una nueva
        if (newPassword) {
            if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
                return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.' });
            }
            // Asigna la NUEVA CONTRASEÑA EN TEXTO PLANO al campo user.password.
            // El pre('save') hook de Mongoose se encargará de hashearla.
            user.password = newPassword; 
        }

        await user.save(); // Guarda los cambios en la base de datos

        console.log('Usuario actualizado y guardado en DB:', user._id, 'Nuevo Username:', user.username);
        console.log('Nuevo hash de contraseña (si se actualizó):', user.password); 

        res.json({ message: 'Perfil actualizado exitosamente.', user: { id: user._id, username: user.username, email: user.email } });

    } catch (error) {
        console.error('Error al actualizar el perfil del usuario (capturado en catch):', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar perfil.' });
    }
});


module.exports = router;
