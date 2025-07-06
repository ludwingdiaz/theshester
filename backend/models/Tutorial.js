// backend/models/Tutorial.js
const mongoose = require('mongoose');

// Definir el Schema y el Modelo para los tutoriales
const tutorialSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true
    },
    path: {
        type: String,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    category: {
        type: String
    },
    views: {
        type: Number,
        default: 0
    },
    // ¡NUEVO CAMPO! Para el nombre del autor
    author: {
        type: String,
        required: true, // Puedes hacerlo opcional si no siempre hay un autor
        default: 'Anonimous' // Valor por defecto si no se especifica
    }
}, { timestamps: true });

const Tutorial = mongoose.model('Tutorial', tutorialSchema);

module.exports = Tutorial;
