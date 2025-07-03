// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Importar bcryptjs

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // El nombre de usuario debe ser único
        trim: true, // Elimina espacios en blanco al inicio y al final
        minlength: 3 // Mínimo 3 caracteres para el nombre de usuario
    },
    email: {
        type: String,
        required: true,
        unique: true, // El correo electrónico debe ser único
        trim: true,
        lowercase: true, // Guarda el email en minúsculas
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Validación de formato de email simple
    },
    password: {
        type: String,
        required: true,
        minlength: 8 // Mínimo 8 caracteres para la contraseña
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware de Mongoose: Hashear la contraseña antes de guardar el usuario
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) { // Solo hashear si la contraseña ha sido modificada (o es nueva)
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10); // Genera un "salt" para hashear
        this.password = await bcrypt.hash(this.password, salt); // Hashea la contraseña
        next();
    } catch (error) {
        next(error); // Pasa el error al siguiente middleware de error
    }
});

module.exports = mongoose.model('User', userSchema);