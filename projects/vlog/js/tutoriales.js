// /projects/vlog/js/tutoriales.js

document.addEventListener('DOMContentLoaded', async () => {
    const postsContainer = document.getElementById('postsContainer');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const loadMoreButton = document.getElementById('loadMoreButton');

    // ¡ELIMINAR ESTAS LÍNEAS! Ya no las necesitamos aquí.
    // const logoutNavItem = document.getElementById('logoutNavItem');
    // const logoutButton = document.getElementById('logoutButton');

    let allDynamicPosts = [];
    let displayedPostsCount = 0;
    const postsPerPage = 6;

    // ¡ELIMINAR ESTA FUNCIÓN! auth.js se encargará.
    // function updateAuthUI() {
    //     const token = localStorage.getItem('jwtToken');
    //     if (token) {
    //         logoutNavItem.style.display = 'list-item';
    //     } else {
    //         logoutNavItem.style.display = 'none';
    //     }
    // }

    // ¡ELIMINAR ESTE BLOQUE! auth.js se encargará del evento click del botón de cerrar sesión.
    // if (logoutButton) {
    //     logoutButton.addEventListener('click', (e) => {
    //         e.preventDefault();
    //         localStorage.removeItem('jwtToken');
    //         updateAuthUI();
    //         alert('Sesión cerrada correctamente.');
    //     });
    // }

    // --- Función para formatear la fecha (usada para posts dinámicos) ---
    function formatPostDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    // --- Función para obtener el número de comentarios de un artículo ---
    async function getCommentCount(articleId) {
        try {
            const response = await fetch(`https://tutorial-views-api.onrender.com/api/comments/article/${articleId}/count`);
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
    async function incrementPostViews(slug) {
        try {
            await fetch(`https://tutorial-views-api.onrender.com/api/posts/${slug}/views`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error('Error al incrementar vistas:', error);
        }
    }

    // --- Función para renderizar un post dinámico ---
    async function renderDynamicPostCard(post) {
        const commentCount = await getCommentCount(post.slug);

        const card = document.createElement('div');
        card.className = 'tutorials-list__card';
        card.innerHTML = `
            <div class="card-content">
                <h4 class="card-title">
                    <a href="./${post.slug}.html" data-slug="${post.slug}">${post.title}</a>
                </h4>
                <p class="card-category">${post.category}</p>
                <p class="card-description">${post.description}</p>
            </div>
            <div class="card-footer">
                <div class="card-stats">
                    <div class="card-views">
                        <img src="https://static.thenounproject.com/png/201934-200.png" width="24" height="24" alt="Vistas">
                        <p>${post.views || 0}</p>
                    </div>
                    <div class="card-comments">
                        <img src="https://cdn-icons-png.flaticon.com/512/1380/1380338.png" width="24" height="24" alt="Comentarios">
                        <p>${commentCount}</p>
                    </div>
                    <div class="card-web-link">
                        <a href="./${post.slug}.html" data-slug="${post.slug}">
                            <img src="https://icon-library.com/images/url-icon-png/url-icon-png-7.jpg" width="24" height="24" alt="Enlace Web">
                        </a>
                    </div>
                </div>
                <div class="card-meta">
                    <p class="card-date">${formatPostDate(post.createdAt)}</p>
                    <p class="card-author">Por Ludwing D.</p>
                </div>
            </div>
        `;
        postsContainer.appendChild(card);

        // Añadir evento click al enlace del título y al enlace web para incrementar vistas
        card.querySelectorAll('a[data-slug]').forEach(link => {
            link.addEventListener('click', () => {
                incrementPostViews(link.dataset.slug);
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
            const response = await fetch('https://tutorial-views-api.onrender.com/api/posts');
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
    // ¡ELIMINAR ESTA LÍNEA! updateAuthUI ya no está en este archivo.
    // updateAuthUI(); // auth.js se encargará de esto.

    // Enlazar los eventos de incremento de vistas a los posts estáticos YA existentes en el HTML
    postsContainer.querySelectorAll('.tutorials-list__card a[data-slug]').forEach(link => {
        link.addEventListener('click', () => {
            incrementPostViews(link.dataset.slug);
        });
    });

    fetchDynamicPosts(); // Cargar los posts dinámicos
});