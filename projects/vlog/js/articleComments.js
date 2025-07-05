// frontend/js/articleComments.js
// Este script maneja la lógica de comentarios para un artículo específico,
// incluyendo la carga, envío y ahora, una modal de login para usuarios no autenticados.

document.addEventListener('DOMContentLoaded', async () => {
    console.log("articleComments.js: DOMContentLoaded - Inicializando sistema de comentarios.");

    // ====================================================================
    // 1. Referencias a Elementos del DOM
    // ====================================================================
    const commentForm = document.getElementById('comment-form');
    const commentText = document.getElementById('comment-text');
    const commentMessage = document.getElementById('comment-message');
    const commentsList = document.getElementById('comments-list');
    const commentsCount = document.getElementById('comments-count');

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
                    <p class="login-link">¿No tienes una cuenta? <a href="/projects/forms/registro.html">Regístrate aquí</a></p>
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
                    z-index: 1000; /* Asegura que esté por encima de todo */
                }
                .modal-content {
                    background-color: #fff;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                    position: relative;
                    width: 90%;
                    max-width: 400px; /* Ancho máximo para la modal */
                    text-align: center;
                }
                .modal-close-button {
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    font-size: 24px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #333;
                }
                .modal-close-button:hover {
                    color: #000;
                }
                .modal-content h2 {
                    margin-bottom: 20px;
                    color: #333;
                    font-size: 22px;
                }
                .modal-overlay.hidden {
                    display: none;
                }
                /* Reutilizando clases del formulario */
                .modal-content .form-group label {
                    text-align: left;
                    display: block;
                    margin-bottom: 5px;
                    font-weight: bold;
                }
                .modal-content .form-group input {
                    width: calc(100% - 20px); /* Ajusta si tienes padding */
                    padding: 10px;
                    margin-bottom: 15px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    box-sizing: border-box;
                }
                .modal-content .submit-button {
                    width: 100%;
                    padding: 10px;
                    background-color: #007bff; /* Color de botón primario */
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                }
                .modal-content .submit-button:hover {
                    background-color: #0056b3;
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
                    color: #007bff;
                    text-decoration: none;
                }
                .modal-content .login-link a:hover {
                    text-decoration: underline;
                }
                .modal-content .form-logo {
                    max-width: 60px; /* Tamaño del logo en la modal */
                    margin-bottom: 15px;
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
                const response = await fetch('https://tutorial-views-api.onrender.com/api/auth/login', { // Asume esta es tu ruta de login
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('jwtToken', data.token); // Guarda el nuevo token
                    token = data.token; // Actualiza la variable 'token' en este script
                    showMessage(modalLoginMessage, 'Inicio de sesión exitoso. Enviando comentario...', false);
                    loginModalOverlay.classList.add('hidden'); // Oculta la modal

                    // Re-intenta enviar el comentario original después del login exitoso
                    // Esto simula que el usuario no tuvo que hacer clic de nuevo.
                    // Dispara el evento 'submit' en el formulario de comentarios original
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
        // Opcional: limpiar los campos del formulario de login en la modal
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
            const response = await fetch(`https://tutorial-views-api.onrender.com/api/comments/article/${articleId}`, {
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
    // 5. Manejo del Envío del Formulario de Comentarios
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
                const response = await fetch(`https://tutorial-views-api.onrender.com/api/comments/article/${articleId}`, {
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
    // 6. Cargar Comentarios al Inicio
    // ====================================================================
    loadArticleComments();
});
