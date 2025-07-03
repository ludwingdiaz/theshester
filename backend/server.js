// server.js

// Carga las variables de entorno desde .env
require('dotenv').config();


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; // El puerto del servidor, usa 3000 si no está en .env

// Middleware
//app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json()); // Permite a Express parsear JSON en el cuerpo de las solicitudes

app.use(cors({
    origin: 'https://ludwingdiaz.site' // Tu dominio de frontend
}));

// Conexión a MongoDB
// Obtén la URI de MongoDB de tus variables de entorno o usa una local por defecto
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/tutorialViewsDB';

mongoose.connect(mongoURI)
    .then(() => console.log('Conectado a MongoDB Atlas/Local'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

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

// Rutas de la API

// 1. Ruta para obtener las vistas de un tutorial y/o incrementarlas
app.post('/api/views', async (req, res) => {
    const { tutorialPath } = req.body; // Esperamos que el frontend envíe el 'path'

    if (!tutorialPath) {
        return res.status(400).json({ message: 'tutorialPath es requerido' });
    }

    try {
        // Encontrar el tutorial por su path
        // Si no existe, lo crea con views = 1
        // Si existe, incrementa views en 1
        const tutorial = await Tutorial.findOneAndUpdate(
            { path: tutorialPath },
            { $inc: { views: 1 } }, // $inc incrementa el campo 'views' en 1
            { upsert: true, new: true, setDefaultsOnInsert: true } // upsert: si no existe, lo crea; new: devuelve el documento actualizado; setDefaultsOnInsert: aplica defaults al crear
        );

        res.status(200).json({
            path: tutorial.path,
            views: tutorial.views,
            message: 'Vistas actualizadas exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar las vistas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Opcional: Ruta para obtener todas las vistas (útil para depuración o dashboard)
app.get('/api/views', async (req, res) => {
    try {
        const tutorials = await Tutorial.find({});
        res.status(200).json(tutorials);
    } catch (error) {
        console.error('Error al obtener todas las vistas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});