// backend/config/cloudinaryConfig.js
require('dotenv').config(); // Asegúrate de cargar dotenv aquí también

const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary; // Exporta el objeto cloudinary configurado