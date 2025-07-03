// backend/server.js

// Carga las variables de entorno desde .env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// Ya no necesitamos bcrypt aquí, porque se usa dentro del modelo User.js

const app = express();
const PORT = process.env.PORT || 3000;

// Importa los routers
const commentsRouter = require('./routes/comments'); // Si ya lo tienes, si no, puedes omitirlo por ahora
const viewsRouter = require('./routes/views');       // Si ya lo tienes, si no, puedes omitirlo por ahora
const authRouter = require('./routes/auth');         // NUEVO: Importa el router de autenticación

// Middleware global
app.use(express.json()); // Permite a Express parsear JSON en el cuerpo de las solicitudes

app.use(cors({
    origin: 'https://ludwingdiaz.site' // Tu dominio de frontend
    //origin: ['https://ludwingdiaz.site', 'http://127.0.0.1:5500'], // Añade tu origen local aquí
    //methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
    //allowedHeaders: ['Content-Type', 'Authorization'] // Cabeceras permitidas (Content-Type es crucial para JSON)
}));

// Conexión a MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/tutorialViewsDB'; // Asegúrate de que apunte a tu DB real

mongoose.connect(mongoURI)
    .then(() => console.log('Conectado a MongoDB Atlas/Local'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// ====================================================================
// Usar los routers para organizar las rutas de la API
// ====================================================================
// app.use('/api/comments', commentsRouter); // Descomenta si ya tienes el router de comentarios
app.use('/api/views', viewsRouter);     // Descomenta si ya tienes el router de vistas
app.use('/api/auth', authRouter);         // NUEVO: Todas las rutas en authRouter se prefijan con /api/auth


// Opcional: Ruta de bienvenida o para verificar que el servidor está corriendo
app.get('/', (req, res) => {
    res.status(200).send('API del servidor de Ludwing Díaz funcionando. Visita /api/auth/register');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});