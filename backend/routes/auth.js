// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');     
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware'); 
const upload = require('../middleware/upload'); 
const cloudinary = require('../config/cloudinaryConfig'); 


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
    // Asegúrate de que esta validación de complejidad de contraseña sea consistente con la de cambio de contraseña
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return res.status(400).json({ message: 'La contraseña debe incluir mayúsculas, minúsculas, números y al menos un símbolo.' });
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

        console.log('Usuario guardado exitosamente en la base de datos:', newUser._id);
        
        res.status(201).json({
            message: 'Usuario registrado exitosamente. Ya puedes iniciar sesión.',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profilePicture: newUser.profilePicture // Incluye la URL por defecto
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
            console.log('Login Fallido: Usuario no encontrado para email:', email); 
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        console.log('Depuración de Login:');
        console.log('  Email recibido:', email);
        console.log('  Contraseña recibida (texto plano):', password);
        console.log('  Hash de contraseña del usuario en DB (user.password):', user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        
        console.log('  Resultado de bcrypt.compare (isMatch):', isMatch);

        if (!isMatch) {
            console.log('Login Fallido: Contraseña no coincide para usuario:', user.username); 
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
                        role: user.role,
                        profilePicture: user.profilePicture // Incluye la URL de la foto de perfil
                    }
                });
            }
        );

    } catch (error) {
        console.error('Error al iniciar sesión (capturado en catch):', error); 
        res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.' });
    }
});

// --- RUTA: Obtener el perfil del usuario autenticado ---
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); 
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json(user); 
    } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener el perfil.' });
    }
});

// Ruta para actualizar el perfil del usuario (incluyendo la foto de perfil)
router.put('/profile/:userId', authMiddleware, upload.single('profilePicture'), async (req, res) => {
    const { userId } = req.params;
    const { username, currentPassword, newPassword } = req.body; 

    try {
        if (!req.user || (req.user.id !== userId && req.user.role !== 'admin')) {
            return res.status(403).json({ message: 'No tienes permiso para editar este perfil o token inválido.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // 2. Verificar la contraseña actual CONDICIONALMENTE (solo si se cambia la contraseña)
        if (newPassword) { 
            if (!currentPassword) {
                return res.status(400).json({ message: 'La contraseña actual es requerida para cambiar la contraseña.' });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Contraseña actual incorrecta.' });
            }
            user.password = newPassword; 
        } 

        // 3. Actualizar el nombre de usuario si se proporcionó y es diferente
        if (username && username !== user.username) {
            const existingUserWithNewUsername = await User.findOne({ username });
            if (existingUserWithNewUsername && existingUserWithNewUsername._id.toString() !== userId) {
                return res.status(400).json({ message: 'Ese nombre de usuario ya está en uso.' });
            }
            user.username = username;
        }

        // 4. Lógica para subir/cambiar la foto de perfil
        if (req.file) { 
            const defaultPublicId = '70bba0a0431785d3f86227e24e48e023'; 
            
            if (user.profilePicturePublicId && user.profilePicturePublicId !== defaultPublicId) {
                try {
                    await cloudinary.uploader.destroy(user.profilePicturePublicId);
                    console.log(`Antigua imagen de Cloudinary eliminada: ${user.profilePicturePublicId}`);
                } catch (deleteError) {
                    console.error('Error al eliminar la imagen antigua de Cloudinary:', deleteError);
                }
            }

            // --- CORRECCIÓN CLAVE AQUÍ ---
            // Construye la cadena Data URI para pasarla a Cloudinary
            const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, { 
                folder: 'profile_pictures', 
                resource_type: 'auto', 
            });

            user.profilePicture = result.secure_url;
            user.profilePicturePublicId = result.public_id;
        }

        await user.save(); 

        const { password: _, ...userWithoutPassword } = user.toObject(); 
        res.json({ 
            message: 'Perfil actualizado exitosamente.', 
            user: userWithoutPassword 
        });

    } catch (error) {
        console.error('Error al actualizar el perfil del usuario:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar perfil.' });
    }
});

// --- Rutas de 2FA (Ejemplo - Necesitarías implementar la lógica real) ---
router.get('/2fa/status', authMiddleware, async (req, res) => {
    res.json({ enabled: false, message: '2FA functionality is under development.' });
});

router.post('/2fa/enable', authMiddleware, async (req, res) => {
    res.status(200).json({ message: '2FA activation is under development.' });
});

router.post('/2fa/disable', authMiddleware, async (req, res) => {
    res.status(200).json({ message: '2FA deactivation is under development.' });
});

// --- Rutas de Sesiones (Ejemplo - Necesitarías implementar la lógica real) ---
router.get('/sessions', authMiddleware, async (req, res) => {
    res.json({ sessions: [{ device: 'Current Device', location: 'Unknown', lastActivity: new Date() }], message: 'Session management is under development.' });
});

router.post('/sessions/logout-all-others', authMiddleware, async (req, res) => {
    res.status(200).json({ message: 'Logout all other sessions functionality is under development.' });
});

module.exports = router;
