// backend/server.js

// Carga las variables de entorno desde .env
require('dotenv').config();

const authMiddleware = require('./middleware/authMiddleware');
const authorizeRoles = require('./middleware/roleMiddleware');

const express = require('express');
const path = require('path'); // Asegúrate de que 'path' esté importado
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
// Configuración de EJS y Archivos Estáticos
// ====================================================================

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');

const viewsPath = path.join(__dirname, '../projects/views');
app.set('views', viewsPath);
console.log('Express está buscando vistas EJS en:', viewsPath);

const projectsStaticPath = path.join(__dirname, '../projects');
app.use('/projects', express.static(projectsStaticPath));
console.log('Express está sirviendo /projects desde:', projectsStaticPath);

const assetsStaticPath = path.join(__dirname, '../assets');
app.use('/assets', express.static(assetsStaticPath));
console.log('Express está sirviendo /assets desde:', assetsStaticPath);

// ====================================================================
// Importa los routers
// ====================================================================
const authRouter = require('./routes/auth');
const commentsRouter = require('./routes/comments');
const viewsRouter = require('./routes/views'); // Tu router para las páginas EJS
const tutorialApiRouter = require('./routes/tutorialApi'); // Importa tu archivo tutorialApi.js
const postsRouter = require('./routes/posts'); // ¡¡¡IMPORTA EL ROUTER DE POSTS!!!

// Conexión a MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/tutorialViewsDB';

mongoose.connect(mongoURI)
    .then(() => console.log('Conectado a MongoDB Atlas/Local'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// ====================================================================
// Usar los routers para organizar las rutas de la API y las Vistas
// ====================================================================

app.use('/api/auth', authRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/views', tutorialApiRouter); // Monta tutorialApiRouter bajo /api/views
app.use('/api/posts', postsRouter); // ¡¡¡MONTA EL ROUTER DE POSTS REAL!!!

// Usar el router de vistas para tus páginas EJS
app.use('/', viewsRouter); 

// ====================================================================
// Rutas Protegidas
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
