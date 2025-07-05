// backend/middleware/roleMiddleware.js

// Este middleware asume que authMiddleware YA SE HA EJECUTADO
// y ha adjuntado el objeto de usuario decodificado a `req.user`.

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Verificar si req.user existe y tiene un rol
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Acceso denegado. No se encontró rol de usuario.' });
        }

        // Verificar si el rol del usuario está en la lista de roles permitidos
        if (allowedRoles.includes(req.user.role)) {
            next(); // El usuario tiene el rol permitido, pasa al siguiente middleware/ruta
        } else {
            // El usuario no tiene el rol necesario
            res.status(403).json({ message: 'Acceso denegado. No tienes permisos para esta acción.' });
        }
    };
};

module.exports = authorizeRoles;