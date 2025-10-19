// backend/server.js

// Carga las variables de entorno desde .env (si estás en desarrollo local)
require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');    
const fetch = require('node-fetch').default;

const { getClanMembers ,getPlayerDetails  } = require('./middleware/clashRoyaleApi');
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
const clashRoyaleRoutes = require('./routes/clashroyale');

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

app.use('/api/clashroyale', clashRoyaleRoutes);

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

    app.get('/members', async (req, res) => {
        // 1. Define el tag del clan que quieres mostrar
        // ¡OJO! Reemplaza este tag con el tag real del clan (sin el # inicial)
        const CLAN_TAG = '8GVJUULV';

        try {
            // 2. Llama a la API para obtener los datos
            const clanData = await getClanMembers(CLAN_TAG);

            // 3. Renderiza la vista members.ejs y le pasa los datos.
            // Asume que la vista espera una propiedad 'members' (array de jugadores)
            // y 'clanName'
            res.render('members', {
                members: clanData.members,
                clanName: clanData.name,
                error: null // No hay error
            });

        } catch (error) {
            console.error("Error al obtener datos del clan:", error.message);
            // Manejo de errores: Puedes renderizar la misma vista con un mensaje de error
            res.status(500).render('members', {
                members: [],
                clanName: "Error de carga",
                error: error.message
            });
        }
    });
});

// Asegúrate de que esta ruta use la API interna
// backend/server.js

app.get('/members', async (req, res) => {
    
    // 1. Definimos el Tag con el '#'
    const clanTagWithHash = '#8GVJUULV'; 

    // 2. 🛑 CODIFICAMOS el Tag para que el '#' se convierta en '%23'
    const encodedTag = encodeURIComponent(clanTagWithHash);
    
    // 3. Creamos la URL usando el Tag CODIFICADO
    const apiURL = `http://localhost:3000/api/clashroyale/clan/${encodedTag}`;
    
    // DEBUG: Esta variable apiURL ahora contiene: 
    // http://localhost:3000/api/clashroyale/clan/%238GVJUULV
    
    console.log("Llamando a API interna:", apiURL); // Útil para verificar

    try {
        const apiResponse = await fetch(apiURL);

        if (!apiResponse.ok) {
            // El error 404/HTML de Express debería ser atrapado aquí
            const errorText = await apiResponse.text();
            throw new Error(`Error en API interna (Status: ${apiResponse.status}): ${errorText.substring(0, 100)}...`);
        }
        
        // Si la respuesta fue exitosa, lee el JSON
        const data = await apiResponse.json(); 
        
        // Renderiza la vista 'members' con los datos JSON correctos
        res.render('members', { 
            clanName: data.name, 
            members: data.members // Esto contiene el array de jugadores
        });

    } catch (error) {
        console.error("Error al cargar la página de miembros:", error.message);
        
        // Manejo del error de la vista (que ya sabemos que falla)
        res.render('error', { 
            message: `Error interno al obtener el clan: ${error.message}`,
            details: error.message.includes('SyntaxError') ? 'La ruta interna devolvió HTML en lugar de JSON.' : 'Verifique el token o la IP.'
        });
    }
});


// backend/server.js (o donde manejes tus rutas de Express)

// Asegúrate de que tu API Key esté disponible (idealmente en variables de entorno)

// ====================================================================
// Iniciar el servidor
// ====================================================================
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});
