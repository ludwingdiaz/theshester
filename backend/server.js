    // backend/server.js

    // Carga las variables de entorno desde .env (si estás en desarrollo local)
    require('dotenv').config();

    const express = require('express');
    const path = require('path');
    const mongoose = require('mongoose');
    const cors = require('cors'); 
    // const cloudinary = require('cloudinary').v2; // <-- ELIMINA ESTA LÍNEA

    const app = express();
    app.disable('etag'); 

    const PORT = process.env.PORT || 3000; 

    // ====================================================================
    // Middleware global SIEMPRE al principio
    // ====================================================================
    app.use(express.json()); 
    app.use(express.urlencoded({ extended: true })); // Para parsear application/x-www-form-urlencoded

    // Configuración de CORS
    app.use(cors({
        origin: [
            'https://ludwingdiaz.site', 
            'https://www.ludwingdiaz.site', 
            'https://tutorial-views-api.onrender.com', 
            'http://127.0.0.1:5500', 
            'http://localhost:5500', 
            'http://localhost:3000'  
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
        allowedHeaders: ['Content-Type', 'Authorization'] 
    }));


    // ====================================================================
    // Configuración de EJS y Archivos Estáticos
    // ====================================================================
    app.set('view engine', 'ejs');
    const viewsPath = path.join(__dirname, '../projects/views'); 
    app.set('views', viewsPath);
    const projectsStaticPath = path.join(__dirname, '../projects');
    app.use('/projects', express.static(projectsStaticPath));
    const assetsStaticPath = path.join(__dirname, '../assets');
    app.use('/assets', express.static(assetsStaticPath));

    // CONFIGURACIÓN DE CLOUDINARY: AHORA ESTÁ CENTRALIZADA EN backend/config/cloudinaryConfig.js
    // YA NO NECESITAS CONFIGURARLO AQUÍ DIRECTAMENTE.
    // cloudinary.config({ // <-- ELIMINA ESTE BLOQUE COMPLETO
    //     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    //     api_key: process.env.CLOUDINARY_API_KEY,
    //     api_secret: process.env.CLOUDINARY_API_SECRET
    // });

    // ====================================================================
    // Define la URL base del frontend 
    // ====================================================================
    let FRONTEND_BASE_URL;
    if (process.env.NODE_ENV === 'production') {
        FRONTEND_BASE_URL = 'https://tutorial-views-api.onrender.com';
    } else {
        FRONTEND_BASE_URL = `http://localhost:${PORT}`; 
    }
    app.use((req, res, next) => {
        res.locals.FRONTEND_BASE_URL = FRONTEND_BASE_URL;
        next();
    });


    // ====================================================================
    // Importa los routers de la API y Vistas
    // ====================================================================
    const authRouter = require('./routes/auth'); 
    const commentsRouter = require('./routes/comments');
    const viewsRouter = require('./routes/views'); 
    const tutorialApiRouter = require('./routes/tutorialApi'); 
    const postsRouter = require('./routes/posts'); 

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
    app.use('/api/views', tutorialApiRouter); 
    app.use('/api/posts', postsRouter); 
    app.use('/', viewsRouter); 

    // Rutas Protegidas de Ejemplo 
    const authMiddleware = require('./middleware/authMiddleware'); 
    const authorizeRoles = require('./middleware/roleMiddleware'); 

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

    app.get('/products', (req, res) => {
    // Express busca automáticamente el archivo "products.ejs"
    // en la carpeta que definiste con app.set('views', ...)
    res.render('products'); 
});

    // ====================================================================
    // Iniciar el servidor
    // ====================================================================
    app.listen(PORT, () => {
        console.log(`Servidor escuchando en http://localhost:${PORT}`);
        console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
    