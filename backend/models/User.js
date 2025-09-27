// backend/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    },
    profilePicture: { // URL de la imagen en Cloudinary
        type: String,
        // Sugerencia: Usa una URL de Cloudinary para tu imagen por defecto también
        default: 'https://asset.cloudinary.com/dvulqsi0o/70bba0a0431785d3f86227e24e48e023' 
    },
    profilePicturePublicId: { // Public ID de la imagen en Cloudinary, para su eliminación
        type: String,
        default: null
    }
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('User', UserSchema);