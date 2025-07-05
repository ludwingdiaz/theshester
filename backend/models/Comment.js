// backend/models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        maxlength: 500
    },
    user: { // Referencia al usuario que hizo el comentario
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Asume que tienes un modelo User
        required: true
    },
    username: { // Para mostrar el nombre del usuario sin necesidad de poblar
        type: String,
        required: true
    },
    articleId: { // <--- ¡NUEVO CAMPO! ID único del artículo
        type: String, // Podría ser String si es un slug o ObjectId si tienes un modelo Article
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);