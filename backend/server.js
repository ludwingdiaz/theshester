// backend/server.js

// Carga las variables de entorno desde .env
require('dotenv').config();

const authMiddleware = require('./middleware/authMiddleware');
const authorizeRoles = require('./middleware/roleMiddleware');

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.disable('etag'); 
const PORT = process.env.PORT || 3000;

// ====================================================================
// Middleware global SIEMPRE al principio
// ====================================================================
app.use(express.json()); 
app.use(cors({
    origin: [
        'https://ludwingdiaz.site',
        'https://ludwingdiaz.site/',
        'http://127.0.0.1:5500',
        'http://localhost:5500' 
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ====================================================================
// Configuración de EJS y Archivos Estáticos (¡AJUSTE DE RUTA DE VISTAS AQUÍ!)
// ====================================================================

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
// Configurar la ruta donde Express buscará tus archivos .ejs
// ¡CORRECCIÓN DE LA RUTA DE VISTAS!
app.set('views', path.join(__dirname, '../', 'projects', 'views')); // <--- ¡ESTA ES LA LÍNEA CORREGIDA!

// Middleware para servir archivos estáticos (CSS, JS, imágenes, etc.)
// Desde backend/server.js, para servir la carpeta 'projects' como '/projects'
app.use('/projects', express.static(path.join(__dirname, '../', 'projects')));
// Servir la carpeta 'assets' en la raíz de 'theshester/' como '/assets'
app.use('/assets', express.static(path.join(__dirname, '../', 'assets'))); // <--- ¡ESTA ES LA LÍNEA CORREGIDA!

// ====================================================================
// Importa los routers (después de la configuración de estáticos y EJS)
// ====================================================================
const authRouter = require('./routes/auth');
const commentsRouter = require('./routes/comments');
const viewsRouter = require('./routes/views'); 

// ====================================================================
// Conexión a MongoDB
// ====================================================================
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/tutorialViewsDB';

mongoose.connect(mongoURI)
    .then(() => console.log('Conectado a MongoDB Atlas/Local'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// ====================================================================
// Usar los routers para organizar las rutas de la API y las Vistas
// ====================================================================

app.use('/api/auth', authRouter);
app.use('/api/comments', commentsRouter);
app.use('/', viewsRouter); // Monta las rutas de views.js directamente en la raíz

// Usar el router de vistas para tus páginas EJS
app.use('/', viewsRouter); 

// ====================================================================
// Rutas Protegidas (Con middleware real)
// ====================================================================

app.get('/api/protected-data', authMiddleware, authorizeRoles('user'), (req, res) => {
    res.json({
        message: 'Acceso a datos protegidos exitoso para rol de USUARIO!',
        data: {
            userId: req.user.id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role,
            secretInfo: 'Esta es información sensible solo para usuarios con rol de usuario.'
        }
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});