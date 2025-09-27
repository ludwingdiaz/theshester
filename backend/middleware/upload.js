// backend/middleware/upload.js
const multer = require('multer');

// Configuración de Multer para almacenar el archivo en memoria (Buffer)
// Cloudinary puede manejar un buffer directamente, no necesita guardarse en disco
const storage = multer.memoryStorage(); 

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limitar a 5MB (5 megabytes)
    },
    fileFilter: (req, file, cb) => {
        // Aceptar solo imágenes
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen!'), false);
        }
    }
});

module.exports = upload;