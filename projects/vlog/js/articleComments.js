// frontend/js/articleComments.js
// Este script maneja la lógica de comentarios para un artículo específico,
// incluyendo la carga, envío, una modal de login para usuarios no autenticados,
// y el seguimiento de vistas del artículo.

document.addEventListener('DOMContentLoaded', async () => {
    console.log("articleComments.js: DOMContentLoaded - Inicializando sistema de comentarios y seguimiento de vistas.");

    // ====================================================================
    // 0. Configuración de la URL del Backend
    // ====================================================================
    const BASE_URL_BACKEND = 'https://tutorial-views-api.onrender.com';
    console.log(`Conectando al backend en: ${BASE_URL_BACKEND}`);

    // ====================================================================
    // 1. Referencias a Elementos del DOM
    // ====================================================================
    const commentForm = document.getElementById('comment-form');
    const commentText = document.getElementById('comment-text');
    const commentMessage = document.getElementById('comment-message');
    const commentsList = document.getElementById('comments-list');
    const commentsCount = document.getElementById('comments-count');

    // Asumiendo que tienes un elemento en tu HTML para mostrar las vistas (ej. <span id="article-views"></span>)
    const articleViewsDisplay = document.getElementById('article-views'); 

    // Obtener el ID del artículo desde el atributo data-article-id del div principal del artículo
    const articleContainer = document.querySelector('div[data-article-id]');
    const articleId = articleContainer ? articleContainer.dataset.articleId : null;

    if (!articleId) {
        console.error('Error: No se encontró el ID del artículo.');
        commentsList.innerHTML = '<p style="color:red;">Error: No se pudo cargar el identificador del artículo para los comentarios.</p>';
        return;
    }

    let token = localStorage.getItem('jwtToken'); // Variable para el token JWT

    // ====================================================================
    // 2. Funciones Auxiliares
    // ====================================================================

    // Función para mostrar mensajes temporales (éxito/error)
    function showMessage(element, message, isError = false) {
        element.textContent = message;
        element.style.color = isError ? 'red' : 'green';
        element.style.display = 'block';
        setTimeout(() => {
            element.textContent = '';
            element.style.display = 'none';
        }, 3000);
    }

    // ====================================================================
    // 3. Lógica para la Modal de Login
    // ====================================================================

    // Función para crear e insertar la modal de login en el DOM
    function createLoginModal() {
        const modalHtml = `
            <div id="loginModalOverlay" class="modal-overlay hidden">
                <div class="modal-content">
                    <button id="closeLoginModal" class="modal-close-button">&times;</button>
                    <img src="/assets/EmoteBulldog 28x28.png" alt="Logo de Ludwing Díaz" class="form-logo">
                    <h2>Inicia Sesión para Comentar</h2>
                    <form id="modalLoginForm" class="styled-form">
                        <div class="form-group">
                            <label for="modalEmail">Correo Electrónico:</label>
                            <input type="email" id="modalEmail" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="modalPassword">Contraseña:</label>
                            <input type="password" id="modalPassword" name="password" required>
                        </div>
                        <button type="submit" class="submit-button">Iniciar Sesión</button>
                    </form>
                    <p id="modalLoginMessage" class="message"></p>
                    <p class="login-link">¿No tienes una cuenta? <a href="${BASE_URL_BACKEND}/projects/forms/registro.html">Regístrate aquí</a></p>
                </div>
            </div>
            <style>
                /* CSS para la modal */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .modal-content {
                    background-color: #2a2a4a; /* Color de fondo oscuro */
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                    position: relative;
                    width: 90%;
                    max-width: 400px;
                    text-align: center;
                    color: #e0e0e0; /* Color de texto claro */
                }
                .modal-close-button {
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    font-size: 24px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #e0e0e0; /* Color de la X en claro */
                }
                .modal-close-button:hover {
                    color: #fff;
                }
                .modal-content h2 {
                    margin-bottom: 20px;
                    color: #e0e0e0;
                    font-size: 22px;
                }
                .modal-overlay.hidden {
                    display: none;
                }
                .modal-content .form-group label {
                    text-align: left;
                    display: block;
                    margin-bottom: 5px;
                    font-weight: bold;
                    color: #e0e0e0;
                }
                .modal-content .form-group input {
                    width: calc(100% - 20px);
                    padding: 10px;
                    margin-bottom: 15px;
                    border: 1px solid #4a4a6e; /* Borde más oscuro */
                    background-color: #3a3a5a; /* Fondo del input más oscuro */
                    color: #e0e0e0; /* Texto del input claro */
                    border-radius: 4px;
                    box-sizing: border-box;
                }
                .modal-content .submit-button {
                    width: 100%;
                    padding: 10px;
                    background-color: #4a4a6e; /* Color de botón primario */
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                }
                .modal-content .submit-button:hover {
                    background-color: #5a5a7e; /* Hover más claro */
                }
                .modal-content .message {
                    margin-top: 10px;
                    font-size: 14px;
                }
                .modal-content .login-link {
                    margin-top: 20px;
                    font-size: 14px;
                }
                .modal-content .login-link a {
                    color: #88aaff; /* Enlace más claro */
                    text-decoration: none;
                }
                .modal-content .login-link a:hover {
                    text-decoration: underline;
                }
                .modal-content .form-logo {
                    display: block;
                    margin: auto;
                    max-width: 100px;
                    height: 40px;
                }
            </style>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Añadir listeners después de insertar el HTML
        const loginModalOverlay = document.getElementById('loginModalOverlay');
        const closeLoginModalBtn = document.getElementById('closeLoginModal');
        const modalLoginForm = document.getElementById('modalLoginForm');
        const modalLoginMessage = document.getElementById('modalLoginMessage');

        closeLoginModalBtn.addEventListener('click', () => {
            loginModalOverlay.classList.add('hidden');
            modalLoginMessage.textContent = ''; // Limpiar mensaje al cerrar
        });

        // Manejar el envío del formulario de login dentro de la modal
        modalLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('modalEmail').value;
            const password = document.getElementById('modalPassword').value;

            try {
                const response = await fetch(`${BASE_URL_BACKEND}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('jwtToken', data.token);
                    token = data.token;
                    showMessage(modalLoginMessage, 'Inicio de sesión exitoso. Enviando comentario...', false);
                    loginModalOverlay.classList.add('hidden');

                    // Re-intenta enviar el comentario original después del login exitoso
                    commentForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

                } else {
                    const errorData = await response.json();
                    showMessage(modalLoginMessage, errorData.message || 'Error al iniciar sesión.', true);
                }
            } catch (error) {
                console.error('Error de red al intentar iniciar sesión desde modal:', error);
                showMessage(modalLoginMessage, 'Error de conexión con el servidor.', true);
            }
        });
    }

    // Llamar a la función para crear la modal al cargar el DOM
    createLoginModal();

    // Función para mostrar la modal de login
    function showLoginModal() {
        document.getElementById('loginModalOverlay').classList.remove('hidden');
        document.getElementById('modalEmail').value = '';
        document.getElementById('modalPassword').value = '';
        document.getElementById('modalLoginMessage').textContent = '';
    }

    // ====================================================================
    // 4. Función para Cargar Comentarios desde el Backend
    // ====================================================================
    async function loadArticleComments() {
        commentsList.innerHTML = '<p>Cargando comentarios...</p>';

        try {
            const response = await fetch(`${BASE_URL_BACKEND}/api/comments/article/${articleId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                commentsCount.textContent = data.comments.length;
                if (data.comments.length === 0) {
                    commentsList.innerHTML = '<p>Aún no hay comentarios para este artículo. ¡Sé el primero!</p>';
                } else {
                    commentsList.innerHTML = '';
                    data.comments.forEach(comment => {
                        const commentElement = document.createElement('div');
                        commentElement.className = 'comment-item bg-gray-100 p-4 rounded-lg mb-3 shadow-sm'; // Puedes añadir tus clases de estilo
                        const date = new Date(comment.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric', month: 'long', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        });
                        commentElement.innerHTML = `
                            <p class="text-gray-800">"${comment.text}"</p>
                            <p class="text-sm text-gray-600 mt-2">Por: <strong>${comment.username}</strong> el ${date}</p>
                        `;
                        commentsList.appendChild(commentElement);
                    });
                }
            } else {
                const errorData = await response.json();
                commentsList.innerHTML = `<p style="color:red;">Error al cargar comentarios: ${errorData.message}</p>`;
                console.error('Error al cargar comentarios:', errorData);
            }
        } catch (error) {
            console.error('Error de red al cargar comentarios:', error);
            commentsList.innerHTML = '<p style="color:red;">Error de conexión con el servidor al cargar comentarios.</p>';
        }
    }

    // ====================================================================
    // 5. Lógica para el Seguimiento de Vistas del Artículo (¡NUEVO!)
    // ====================================================================
    async function trackArticleView() {
        console.log(`[DEBUG] trackArticleView() llamado para articleId: ${articleId}`); // <-- AÑADE ESTA LÍNEA

        try {
            // Asume que tu backend tiene un endpoint para incrementar vistas
            console.log(`[DEBUG] Enviando solicitud POST para incrementar vistas a: ${BASE_URL_BACKEND}/api/views/article/${articleId}/increment`); // <-- AÑADE ESTA LÍNEA
            const response = await fetch(`${BASE_URL_BACKEND}/api/views/article/${articleId}/increment`, {
                method: 'POST', // O PUT, dependiendo de tu API
                headers: { 'Content-Type': 'application/json' }
            });

            // --- INICIO DEL CAMBIO ---
            if (response.ok) {
                const data = await response.json();
                console.log('Vista de artículo registrada:', data.message);
                if (articleViewsDisplay) {
                    articleViewsDisplay.textContent = data.views; // Actualiza el número de vistas en el DOM
                }
            } else if (response.status === 429) { // Manejo específico del Too Many Requests
                console.warn('Vista de artículo: Solicitud ignorada por el servidor (demasiadas peticiones).');
                // No es un error grave, simplemente la vista ya se contó.
                // No actualizamos el contador de vistas en el frontend aquí, ya que la primera solicitud lo hizo.
            }
            else {
                const errorData = await response.json();
                console.error('Error al registrar vista del artículo:', errorData.message);
            }
            // --- FIN DEL CAMBIO ---
        } catch (error) {
            console.error('Error de red al registrar vista del artículo:', error);
        }
    }

    // ====================================================================
    // 6. Manejo del Envío del Formulario de Comentarios
    // ====================================================================
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evitar el envío por defecto del formulario

            // Si no hay token, muestra la modal de login y detiene el envío actual
            if (!token) {
                showMessage(commentMessage, 'Debes iniciar sesión para comentar.', true);
                showLoginModal(); // Muestra la modal de login
                return;
            }

            const commentContent = commentText.value.trim();
            if (!commentContent) {
                showMessage(commentMessage, 'El comentario no puede estar vacío.', true);
                return;
            }

            try {
                // Petición POST para añadir un comentario al artículo específico
                const response = await fetch(`${BASE_URL_BACKEND}/api/comments/article/${articleId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Incluye el token JWT
                    },
                    body: JSON.stringify({ text: commentContent })
                });

                if (response.ok) {
                    const data = await response.json();
                    showMessage(commentMessage, data.message, false);
                    commentText.value = ''; // Limpiar el textarea
                    await loadArticleComments(); // Recargar la lista de comentarios para ver el nuevo
                } else if (response.status === 400) {
                    const errorData = await response.json();
                    showMessage(commentMessage, errorData.message, true);
                } else if (response.status === 401 || response.status === 403) {
                    const errorData = await response.json();
                    showMessage(commentMessage, `Error de autorización: ${errorData.message}. Por favor, inicia sesión de nuevo.`, true);
                    localStorage.removeItem('jwtToken'); // Eliminar token inválido
                    token = null; // Actualizar la variable local
                    showLoginModal(); // Muestra la modal de login
                } else {
                    showMessage(commentMessage, 'Error desconocido al publicar el comentario.', true);
                }

            } catch (error) {
                console.error('Error de red al publicar comentario:', error);
                showMessage(commentMessage, 'Error de conexión con el servidor al publicar comentario.', true);
            }
        });
    } else {
        console.warn("Formulario de comentarios no encontrado.");
    }

    // ====================================================================
    // 7. Acciones al Cargar la Página (Cargar Comentarios y Rastrear Vista)
    // ====================================================================
    await loadArticleComments(); // Cargar comentarios existentes
    trackArticleView(); // Registrar la vista del artículo
});
