// tutoriales.js (este archivo se enlaza en tutoriales.html)

document.addEventListener('DOMContentLoaded', async () => {
    const tutorialCards = document.querySelectorAll('.tutorials-list__card');
    const backendUrl = 'https://tutorial-views-api.onrender.com'; // Asegúrate de que esta URL sea correcta

    // 1. Función para OBTENER y mostrar las vistas iniciales de todas las tarjetas al cargar la página
    async function fetchAndDisplayInitialViews() {
        try {
            // Realiza una petición GET al endpoint que devuelve todas las vistas
            const response = await fetch(`${backendUrl}/api/views`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}: ${errorData.message || response.statusText}`);
            }
            const data = await response.json(); // Array de objetos { path: "ruta/del/tutorial.html", views: 5 }

            // Crea un mapa para acceder fácilmente a las vistas por path
            const viewsMap = new Map();
            data.forEach(item => {
                viewsMap.set(item.path, item.views);
            });

            // Itera sobre cada tarjeta en el HTML y actualiza su contador con las vistas obtenidas
            tutorialCards.forEach(card => {
                const linkElement = card.querySelector('.card-title a');
                const viewsElement = card.querySelector('.card-views p');
                if (linkElement && viewsElement) {
                    const tutorialPath = linkElement.getAttribute('href');
                    // Obtiene las vistas del mapa, si no existe, usa 0
                    const currentViews = viewsMap.get(tutorialPath) || 0;
                    viewsElement.textContent = currentViews;
                }
            });

        } catch (error) {
            console.error('Error al obtener las vistas iniciales:', error);
            // En caso de error, puedes mostrar "N/A" o similar en los contadores
            tutorialCards.forEach(card => {
                const viewsElement = card.querySelector('.card-views p');
                if (viewsElement) viewsElement.textContent = 'N/A';
            });
        }
    }

    // 2. Función para INCREMENTAR la vista de un tutorial específico y luego navegar
    async function incrementViewAndNavigate(tutorialPath, viewsElement, originalHref) {
        try {
            // Realiza una petición POST para incrementar la vista
            const response = await fetch(`${backendUrl}/api/views`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tutorialPath: tutorialPath })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}: ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            viewsElement.textContent = data.views; // Actualiza el contador en la tarjeta inmediatamente

            // Una vez que la vista se ha actualizado en el backend, navega a la página del tutorial
            window.location.href = originalHref;

        } catch (error) {
            console.error('Error al incrementar la vista para:', tutorialPath, error);
            // Si hay un error al incrementar, aún así es importante navegar para no bloquear al usuario
            window.location.href = originalHref;
        }
    }

    // 3. Ejecutar la obtención de vistas iniciales al cargar la página (solo para mostrar, no para incrementar)
    await fetchAndDisplayInitialViews();

    // 4. Añadir Event Listeners a los enlaces de cada tarjeta para incrementar al hacer clic
    tutorialCards.forEach(card => {
        // Selecciona los enlaces dentro de la tarjeta que el usuario podría clicar para ir al tutorial
        // Esto incluye el enlace en el título y el enlace en el icono 'Web link'
        const clickableLinks = card.querySelectorAll('.card-title a, .card-web-link a');

        clickableLinks.forEach(link => {
            const originalHref = link.getAttribute('href'); // Guarda la URL original a la que se va a navegar
            const tutorialPath = originalHref; // El 'href' es el path que queremos usar como ID en el backend
            const viewsElement = card.querySelector('.card-views p'); // El elemento donde se muestra el contador

            link.addEventListener('click', async (event) => {
                event.preventDefault(); // ¡MUY IMPORTANTE! Previene la navegación por defecto del enlace

                // Llama a la función que incrementa la vista y luego navega
                await incrementViewAndNavigate(tutorialPath, viewsElement, originalHref);
            });
        });
    });
});

// Nota: He eliminado de este archivo toda la lógica de `const tutoriales = [...]`, `ordenarTutoriales`,
// y `mostrarTutoriales` porque tus tarjetas HTML están definidas estáticamente en `tutoriales.html`
// y no se generan dinámicamente con JavaScript.