// backend/models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    articleSlug: { // Identificador único del artículo (ej. "generador-contrasenas")
        type: String,
        required: true
    },
    author: { // Nombre del autor del comentario
        type: String,
        required: true
    },
    commentText: { // Contenido del comentario
        type: String,
        required: true
    },
    timestamp: { // Fecha y hora de creación del comentario
        type: Date,
        default: Date.now // Por defecto, la fecha actual al crear
    },
    approved: { // Para moderación (true si es visible, false si necesita revisión)
        type: Boolean,
        default: true // Por ahora, asumimos que los comentarios se aprueban automáticamente
    }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);