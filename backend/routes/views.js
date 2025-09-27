// backend/routes/views.js (¡Solo para renderizar páginas EJS!)
const express = require('express');
const router = express.Router();
const path = require('path'); // Necesario para construir rutas de archivo
const fs = require('fs');     // Necesario para verificar si un archivo existe
const ejs = require('ejs');   // Necesario para renderizar archivos EJS en una cadena
const Tutorial = require('../models/Tutorial'); // ¡¡¡IMPORTAR EL MODELO TUTORIAL!!!

// ================================================================
// RUTAS PARA RENDERIZAR PÁGINAS EJS
// ================================================================

// NUEVO: Ruta para la raíz de la aplicación Express. Redirige a /tutoriales.
router.get('/', (req, res) => {
    console.log('Acceso a la raíz de viewsRouter. Redirigiendo a /tutoriales');
    res.redirect('/tutoriales');
});



// Ruta para la página de tutoriales
router.get('/tutoriales', (req, res) => {
    console.log('Acceso a /tutoriales. Renderizando tutoriales.ejs');
    res.render('tutoriales');
});

// Ruta para la página del diario
router.get('/diario', (req, res) => {
    console.log('Acceso a /diario. Renderizando diario.ejs');
    res.render('diario');
});

router.get('/products', (req, res) => {
    console.log('Acceso a /products. Renderizando products.ejs');
    res.render('products');
});




// ================================================================
// RUTA PARA ARTÍCULOS INDIVIDUALES (DINÁMICOS DESDE ARCHIVOS EJS)
// ================================================================
router.get('/articles/:slug', async (req, res) => {
    const { slug } = req.params; // Captura el 'slug' de la URL (ej. 'generador-contrasenas')

    try {
        // 1. ¡¡¡BUSCAR EL TUTORIAL EN LA BASE DE DATOS USANDO EL SLUG!!!
        const tutorial = await Tutorial.findOne({ slug: slug });

        if (!tutorial) {
            console.warn(`Tutorial no encontrado en la base de datos para el slug: ${slug}`);
            return res.status(404).render('404', { title: 'Página No Encontrada - Ludwing Díaz' });
        }

        // Construye la ruta completa al archivo EJS del artículo
        // Asegúrate de que esta ruta sea correcta para tu estructura de carpetas
        const articleFilePath = path.join(__dirname, '../../projects/views/articles', `${slug}.ejs`);

        // 2. Verificar si el archivo EJS del artículo existe físicamente
        if (!fs.existsSync(articleFilePath)) {
            console.warn(`Archivo EJS no encontrado para el slug: ${slug}. Buscando en: ${articleFilePath}`);
            return res.status(404).render('404', { title: 'Página No Encontrada - Ludwing Díaz' });
        }

        // 3. Renderizar el archivo EJS del artículo en una cadena HTML,
        //    ¡¡¡PASANDO EL OBJETO 'tutorial' completo para que tenga acceso a _id y views!!!
        const articleContentHtml = await ejs.renderFile(articleFilePath, { tutorial: tutorial });

        // 4. Renderizar el 'layout.ejs', pasándole el título, el contenido del artículo,
        //    y el objeto 'tutorial' para que layout o cualquier partial tenga acceso a él.
        res.render('layout', {
            title: `${tutorial.title} - Ludwing Díaz`, // Usar el título real del tutorial de la DB
            articleContent: articleContentHtml,
            tutorial: tutorial // Pasar el objeto tutorial para que esté disponible en el layout
        });

    } catch (error) {
        console.error('Error al cargar el artículo o buscar en DB:', error);
        res.status(500).render('error', { title: 'Error Interno del Servidor - Ludwing Díaz' });
    }
});

module.exports = router;
