// backend/server.js

// Carga las variables de entorno desde .env (si estás en desarrollo local)
require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors'); // Importa el middleware CORS

const app = express();
app.disable('etag'); // Deshabilita ETag para evitar problemas de caché en algunos escenarios, aunque no es la causa principal de carga

const PORT = process.env.PORT || 3000; // Usa el puerto proporcionado por el entorno (Render, Heroku) o 3000 localmente

// ====================================================================
// Middleware global SIEMPRE al principio
// ====================================================================
app.use(express.json()); // Para parsear cuerpos de petición JSON

// Configuración de CORS
// Es crucial para permitir que tu frontend (si está en un dominio diferente) se comunique con tu backend
app.use(cors({
    origin: [
        'https://ludwingdiaz.site', // Tu dominio de producción para el frontend
        'https://www.ludwingdiaz.site', // Si usas www
        'https://tutorial-views-api.onrender.com', // Si tu frontend también se sirve desde Render con una URL diferente
        'http://127.0.0.1:5500', // Para desarrollo local (Live Server)
        'http://localhost:5500', // Otro puerto común para Live Server
        'http://localhost:3000'  // Si tu frontend se sirve desde el mismo puerto del backend en desarrollo
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos HTTP permitidos
    allowedHeaders: ['Content-Type', 'Authorization'] // Cabeceras permitidas
}));


// ====================================================================
// Configuración de EJS y Archivos Estáticos (Solo si el backend sirve el frontend)
// ====================================================================

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');

// Rutas a las vistas EJS
const viewsPath = path.join(__dirname, '../projects/views'); // Asume que views está en projects/views
app.set('views', viewsPath);
console.log('Express está buscando vistas EJS en:', viewsPath);

// Rutas para servir archivos estáticos (CSS, JS, imágenes del frontend)
// Esto es necesario si tu backend también sirve tu frontend HTML/CSS/JS.
// Si tu frontend está desplegado por separado (ej. Netlify, Vercel), estas líneas pueden ser innecesarias
// y podrían incluso causar conflictos si el frontend intenta cargar sus propios assets.
const projectsStaticPath = path.join(__dirname, '../projects');
app.use('/projects', express.static(projectsStaticPath));
console.log('Express está sirviendo /projects desde:', projectsStaticPath);

const assetsStaticPath = path.join(__dirname, '../assets');
app.use('/assets', express.static(assetsStaticPath));
console.log('Express está sirviendo /assets desde:', assetsStaticPath);

// ====================================================================
// Define la URL base del frontend para uso interno del backend (si es necesario)
// Y para el frontend, si lo sirves desde el mismo backend.
// ====================================================================
let FRONTEND_BASE_URL;
if (process.env.NODE_ENV === 'production') {
    // En producción, usa la URL de tu frontend desplegado
    // Si tu frontend está en ludwingdiaz.site:
    FRONTEND_BASE_URL = 'https://tutorial-views-api.onrender.com';
    // O si tu frontend está en Render con su propia URL:
    // FRONTEND_BASE_URL = 'https://tu-frontend-app.onrender.com'; 
} else {
    // En desarrollo, usa localhost y el puerto de tu backend
    FRONTEND_BASE_URL = `http://localhost:${PORT}`; 
    // Si tu frontend se abre con Live Server en un puerto diferente (ej. 5500),
    // y necesitas que el backend lo sepa para alguna redirección, puedes ponerlo aquí:
    // FRONTEND_BASE_URL = 'http://localhost:5500';
}
console.log(`FRONTEND_BASE_URL configurada como: ${FRONTEND_BASE_URL}`);

// Middleware para hacer la URL base disponible en todas las vistas EJS
app.use((req, res, next) => {
    res.locals.FRONTEND_BASE_URL = FRONTEND_BASE_URL;
    next();
});


// ====================================================================
// Importa los routers de la API y Vistas
// ====================================================================
const authRouter = require('./routes/auth');
const commentsRouter = require('./routes/comments');
const viewsRouter = require('./routes/views'); // Tu router para las páginas EJS
const tutorialApiRouter = require('./routes/tutorialApi'); // Router para vistas de tutoriales
const postsRouter = require('./routes/posts'); // Router para la gestión de posts/tutoriales

// Conexión a MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/tutorialViewsDB';

mongoose.connect(mongoURI)
    .then(() => console.log('Conectado a MongoDB Atlas/Local'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// ====================================================================
// Usar los routers para organizar las rutas de la API y las Vistas
// ====================================================================

app.use('/api/auth', authRouter); // Rutas de autenticación (registro, login, perfil)
app.use('/api/comments', commentsRouter); // Rutas para comentarios y estadísticas de comentarios
app.use('/api/views', tutorialApiRouter); // Rutas para incrementar/obtener vistas de tutoriales
app.use('/api/posts', postsRouter); // Rutas para crear/obtener posts/tutoriales

// Usar el router de vistas para tus páginas EJS (rutas como '/', '/diario', '/login', etc.)
app.use('/', viewsRouter); 

// ====================================================================
// Rutas Protegidas de Ejemplo (usando middleware)
// ====================================================================
const authMiddleware = require('./middleware/authMiddleware'); // Asegúrate de que estén importados
const authorizeRoles = require('./middleware/roleMiddleware'); // Asegúrate de que estén importados

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

// ====================================================================
// Iniciar el servidor
// ====================================================================
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});
