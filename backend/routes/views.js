// backend/routes/views.js (¡Solo para renderizar páginas EJS!)
const express = require('express');
const router = express.Router();
const path = require('path'); // Necesario para construir rutas de archivo
const fs = require('fs');     // Necesario para verificar si un archivo existe
const ejs = require('ejs');   // Necesario para renderizar archivos EJS en una cadena

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

// ================================================================
// RUTA PARA ARTÍCULOS INDIVIDUALES (DINÁMICOS DESDE ARCHIVOS EJS)
// ================================================================
router.get('/articles/:slug', async (req, res) => {
    const { slug } = req.params; // Captura el 'slug' de la URL (ej. 'generador-contrasenas')

    // Construye la ruta completa al archivo EJS del artículo
    const articleFilePath = path.join(__dirname, '../../projects/views/articles', `${slug}.ejs`);

    try {
        // 1. Verificar si el archivo del artículo existe
        if (!fs.existsSync(articleFilePath)) {
            console.warn(`Artículo no encontrado: ${slug}.ejs`);
            return res.status(404).render('404', { title: 'Página No Encontrada - Ludwing Díaz' });
        }

        // 2. Renderizar el archivo EJS del artículo en una cadena HTML
        const articleContentHtml = await ejs.renderFile(articleFilePath, {}); 

        // 3. Renderizar el 'layout.ejs', pasándole el título y el contenido del artículo
        res.render('layout', {
            title: `${slug.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} - Ludwing Díaz`, 
            articleContent: articleContentHtml 
        });

    } catch (error) {
        console.error('Error al cargar el artículo:', error);
        res.status(500).render('error', { title: 'Error Interno del Servidor - Ludwing Díaz' });
    }
});

module.exports = router;
