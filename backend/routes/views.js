// backend/routes/views.js (¡Solo para renderizar páginas EJS!)
const express = require('express');
const router = express.Router();
const path = require('path'); // Necesario para construir rutas de archivo
const fs = require('fs');     // Necesario para verificar si un archivo existe
const ejs = require('ejs');   // Necesario para renderizar archivos EJS en una cadena

// NO IMPORTES EL MODELO TUTORIAL AQUÍ SI ESTE ROUTER SOLO ES PARA RENDERIZAR VISTAS
// Si la lógica de Tutorial.find y Tutorial.findOneAndUpdate es para una API,
// debería ir en un router de API separado (ej. tutorialApiRouter.js o en un controlador).
// const Tutorial = require('../models/Tutorial'); 

// ================================================================
// RUTAS PARA RENDERIZAR PÁGINAS EJS
// ================================================================

// Ruta para la página de tutoriales (tu home)
router.get('/tutoriales', (req, res) => {
    // res.render buscará 'tutoriales.ejs' en la carpeta configurada en app.set('views')
    res.render('tutoriales'); 
});

// Ruta para la página del diario
router.get('/diario', (req, res) => {
    // res.render buscará 'diario.ejs' en la carpeta de vistas
    res.render('diario'); 
});

// ================================================================
// NUEVA RUTA PARA ARTÍCULOS INDIVIDUALES (DINÁMICOS DESDE ARCHIVOS EJS)
// ================================================================
router.get('/articles/:slug', async (req, res) => {
    const { slug } = req.params; // Captura el 'slug' de la URL (ej. 'generador-contrasenas')

    // Construye la ruta completa al archivo EJS del artículo
    // Desde views.js, la ruta a theshester/projects/views/articles/
    const articleFilePath = path.join(__dirname, '../../projects/views/articles', `${slug}.ejs`);

    try {
        // 1. Verificar si el archivo del artículo existe
        if (!fs.existsSync(articleFilePath)) {
            // Si el archivo no se encuentra, renderiza una página 404
            // Asegúrate de tener un '404.ejs' en theshester/projects/views/
            return res.status(404).render('404', { title: 'Página No Encontrada - Ludwing Díaz' });
        }

        // 2. Renderizar el archivo EJS del artículo en una cadena HTML
        // No le pasamos datos al artículo EJS en este ejemplo, pero podrías hacerlo
        const articleContentHtml = await ejs.renderFile(articleFilePath, {}); 

        // 3. Renderizar el 'layout.ejs', pasándole el título y el contenido del artículo
        res.render('layout', {
            // Genera un título dinámico a partir del slug (ej. "guia-generador-contrasenas" -> "Guía Generador Contraseñas")
            title: `${slug.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} - Ludwing Díaz`, 
            articleContent: articleContentHtml // El contenido HTML del artículo
        });

    } catch (error) {
        console.error('Error al cargar el artículo:', error);
        // En caso de error del servidor, renderiza una página de error genérica
        // Asegúrate de tener un 'error.ejs' en theshester/projects/views/
        res.status(500).render('error', { title: 'Error Interno del Servidor - Ludwing Díaz' });
    }
});


// ================================================================
// SI LAS RUTAS DE VISTAS (POST y GET) SON PARA UNA API, MUEVELAS A OTRO ARCHIVO
// Por ejemplo, crea backend/routes/tutorialApi.js y ponlas allí.
// Y luego en server.js, haz app.use('/api/tutorials', tutorialApiRouter);
// ================================================================

// Las rutas que tenías para Tutorial.findOneAndUpdate y Tutorial.find
// router.post('/', async (req, res) => { ... });
// router.get('/', async (req, res) => { ... });

module.exports = router;