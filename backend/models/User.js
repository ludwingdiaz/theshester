// backend/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // ¡ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ AQUÍ!

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin']
    },
    registrationDate: {
        type: Date,
        default: Date.now
    }
});

// --- ¡ESTE ES EL HOOK QUE HASHEA LA CONTRASEÑA ANTES DE GUARDAR! ---
UserSchema.pre('save', async function(next) {
    // Solo hashear la contraseña si ha sido modificada (o es nueva)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generar un salt
        const salt = await bcrypt.genSalt(10);
        // Hashear la contraseña usando el salt
        this.password = await bcrypt.hash(this.password, salt);
        next(); // Continuar con el guardado
    } catch (err) {
        next(err); // Pasar el error
    }
});

module.exports = mongoose.model('User', UserSchema);