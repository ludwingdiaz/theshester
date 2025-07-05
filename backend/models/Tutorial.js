// backend/models/Tutorial.js
const mongoose = require('mongoose');

// Definir el Schema y el Modelo para los tutoriales
const tutorialSchema = new mongoose.Schema({
    // El 'slug' es la parte amigable de la URL para el artículo (ej. 'generador-contrasenas')
    slug: {
        type: String,
        required: true,
        unique: true // Cada slug debe ser único
    },
    // El 'path' puede ser la ruta completa al archivo EJS si lo necesitas,
    // pero el 'slug' es lo que se usa para buscar en la URL.
    // Puedes mantener 'path' si lo usas para algo más, o eliminarlo si no.
    path: { // Mantengo 'path' por si lo usas en otras partes de tu código
        type: String,
        unique: true // También debe ser único
    },
    title: { // Es buena idea tener el título del tutorial en el modelo
        type: String,
        required: true
    },
    description: { // Para descripciones cortas en la lista de tutoriales
        type: String
    },
    category: { // Para categorizar tus tutoriales
        type: String
    },
    views: {
        type: Number,
        default: 0 // Inicializa las vistas en 0
    }
}, { timestamps: true }); // 'timestamps' añade createdAt y updatedAt automáticamente

const Tutorial = mongoose.model('Tutorial', tutorialSchema);

module.exports = Tutorial; // Exporta el modelo
