const mongoose = require('mongoose');

// Definir el Schema y el Modelo para los tutoriales
// Un tutorial tendrá un 'path' (que será la URL relativa, como './generador-contraseñas.html') y un 'views' (contador)
const tutorialSchema = new mongoose.Schema({
    path: {
        type: String,
        required: true,
        unique: true // Cada path debe ser único
    },
    views: {
        type: Number,
        default: 0
    }
}, { timestamps: true }); // 'timestamps' añade createdAt y updatedAt automáticamente

const Tutorial = mongoose.model('Tutorial', tutorialSchema);