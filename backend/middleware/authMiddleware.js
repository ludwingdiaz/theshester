// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Obtener el token de la cabecera de autorización
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'No hay token, autorización denegada.' });
    }

    // El formato esperado es "Bearer TOKEN"
    const token = authHeader.split(' ')[1];

    // Verificar si el token existe
    if (!token) {
        return res.status(401).json({ message: 'Formato de token inválido, autorización denegada.' });
    }

    try {
        // Verificar el token
         const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || '8uMh2xZbQp7rVnK0sJf4wYtLgD9cXz1oC6iA3eF5bE7dG2jH0qP9rS1tUvW8yZ0' // <-- ¡AÑADE ESTO!
        );

        // Adjuntar la información del usuario decodificada al objeto de solicitud (req.user)
        req.user = decoded.user;
        next(); // Pasar al siguiente middleware/ruta
    } catch (error) {
        // Si el token no es válido (ej. expirado, corrupto)
        res.status(403).json({ message: 'Token no válido o expirado, autorización denegada.' });
    }
};