// /projects/vlog/js/tutoriales.js

document.addEventListener('DOMContentLoaded', async () => {
    const postsContainer = document.getElementById('postsContainer');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const loadMoreButton = document.getElementById('loadMoreButton');

    // ====================================================================
    // 0. Configuración de la URL del Backend
    // ====================================================================
    const BASE_URL_BACKEND = 'https://tutorial-views-api.onrender.com';
    console.log(`tutoriales.js: Conectando al backend en: ${BASE_URL_BACKEND}`);

    let allDynamicPosts = [];
    let displayedPostsCount = 0;
    const postsPerPage = 6;

    // --- Función para formatear la fecha (usada para posts dinámicos) ---
    function formatPostDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    // --- Función para obtener el número de comentarios de un artículo ---
    async function getCommentCount(articleId) { // Ahora espera articleId (el _id)
        try {
            const response = await fetch(`${BASE_URL_BACKEND}/api/comments/article/${articleId}/count`);
            if (response.ok) {
                const data = await response.json();
                return data.count;
            } else {
                console.error(`Error al obtener el recuento de comentarios para ${articleId}:`, await response.json());
                return 0;
            }
        } catch (error) {
            console.error(`Error de red al obtener el recuento de comentarios para ${articleId}:`, error);
            return 0;
        }
    }

    // --- Función para incrementar las vistas de un post (se llamará cuando se haga click en el enlace) ---
    async function incrementPostViews(postId, viewElement) { // Ahora espera postId (el _id) y el elemento de vistas
        try {
            const response = await fetch(`${BASE_URL_BACKEND}/api/views/article/${postId}/increment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                console.log(`Vistas actualizadas para ${postId}: ${data.views}`);
                if (viewElement) {
                    viewElement.textContent = data.views; // Actualiza el DOM con el nuevo valor
                }
            } else {
                console.error('Error al incrementar vistas:', await response.json());
            }
        } catch (error) {
            console.error('Error de red al incrementar vistas:', error);
        }
    }

    // --- Función para renderizar un post dinámico ---
    async function renderDynamicPostCard(post) {
        // Usar post._id para obtener el conteo de comentarios
        const commentCount = await getCommentCount(post._id); 

        const card = document.createElement('div');
        card.className = 'tutorials-list__card';
        card.innerHTML = `
            <div class="card-content">
                <h4 class="card-title">
                    <a href="/articles/${post.slug}" data-article-id="${post._id}" data-slug="${post.slug}">${post.title}</a>
                </h4>
                <p class="card-category">${post.category}</p>
                <p class="card-description">${post.description}</p>
            </div>
            <div class="card-footer">
                <div class="card-stats">
                    <div class="card-views">
                        <img src="https://static.thenounproject.com/png/201934-200.png" width="24" height="24" alt="Vistas">
                        <p class="view-count">${post.views || 0}</p> <!-- Añadir clase para fácil selección -->
                    </div>
                    <div class="card-comments">
                        <img src="https://cdn-icons-png.flaticon.com/512/1380/1380338.png" width="24" height="24" alt="Comentarios">
                        <p>${commentCount}</p>
                    </div>
                    <div class="card-web-link">
                        <a href="/articles/${post.slug}" data-article-id="${post._id}" data-slug="${post.slug}">
                            <img src="https://icon-library.com/images/url-icon-png/url-icon-png-7.jpg" width="24" height="24" alt="Enlace Web">
                        </a>
                    </div>
                </div>
                <div class="card-meta">
                    <p class="card-date">${formatPostDate(post.createdAt)}</p>
                   <p class="card-author">Por ${post.author || 'Desconocido'}</p> <!-- ¡AHORA ES DINÁMICO! -->
                </div>
            </div>
        `;
        postsContainer.appendChild(card);

        // Seleccionar el elemento de vistas dentro de esta tarjeta específica
        const viewCountElement = card.querySelector('.view-count');

        // Añadir evento click al enlace del título y al enlace web para incrementar vistas
        card.querySelectorAll('a[data-article-id]').forEach(link => {
            link.addEventListener('click', () => {
                // Pasa el _id del post y el elemento HTML donde se muestra la vista
                incrementPostViews(link.dataset.articleId, viewCountElement);
            });
        });
    }

    // --- Función para mostrar posts (filtrados o todos) ---
    async function displayPosts(postsToDisplay) {
        postsContainer.innerHTML = ''; // Limpiar el contenedor COMPLETAMENTE

        const startIndex = displayedPostsCount;
        const endIndex = Math.min(startIndex + postsPerPage, postsToDisplay.length);

        for (let i = startIndex; i < endIndex; i++) {
            await renderDynamicPostCard(postsToDisplay[i]);
        }
        displayedPostsCount = endIndex;

        // Mostrar u ocultar el botón "Cargar más"
        if (displayedPostsCount < postsToDisplay.length) {
            loadMoreButton.style.display = 'block';
        } else {
            loadMoreButton.style.display = 'none';
        }

        if (postsToDisplay.length === 0 && searchInput.value.trim() !== '') {
            postsContainer.innerHTML = '<p style="text-align: center; color: var(--text-color-secondary);">No se encontraron tutoriales con ese criterio de búsqueda.</p>';
        } else if (postsToDisplay.length === 0 && allDynamicPosts.length === 0) {
             postsContainer.innerHTML = '<p style="text-align: center; color: var(--text-color-secondary);">No hay tutoriales disponibles en este momento.</p>';
        }
    }

    // --- Función para cargar posts desde el backend ---
    async function fetchDynamicPosts() {
        try {
            // Asegúrate de que tu backend tenga una ruta /api/posts que devuelva los posts con _id y views
            const response = await fetch(`${BASE_URL_BACKEND}/api/posts`); 
            if (response.ok) {
                const data = await response.json();
                allDynamicPosts = data;
                displayedPostsCount = 0;
                await displayPosts(allDynamicPosts);
            } else {
                console.error('Error al cargar posts dinámicos:', await response.json());
            }
        } catch (error) {
            console.error('Error de red al cargar posts dinámicos:', error);
        }
    }

    // --- Lógica de búsqueda y filtro ---
    function filterAndDisplayPosts() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let postsToFilter = allDynamicPosts;

        if (searchTerm) {
            postsToFilter = allDynamicPosts.filter(post =>
                post.title.toLowerCase().includes(searchTerm) ||
                post.description.toLowerCase().includes(searchTerm) ||
                post.category.toLowerCase().includes(searchTerm)
            );
        }

        displayedPostsCount = 0;
        postsContainer.innerHTML = '';
        displayPosts(postsToFilter);
    }

    searchButton.addEventListener('click', filterAndDisplayPosts);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            filterAndDisplayPosts();
        }
    });

    // --- Lógica de cargar más ---
    loadMoreButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let postsToLoad = allDynamicPosts;
        if (searchTerm) {
            postsToLoad = allDynamicPosts.filter(post =>
                post.title.toLowerCase().includes(searchTerm) ||
                post.description.toLowerCase().includes(searchTerm) ||
                post.category.toLowerCase().includes(searchTerm)
            );
        }
        displayPosts(postsToLoad);
    });

    // --- Inicialización ---
    fetchDynamicPosts(); // Cargar los posts dinámicos al inicio
});
