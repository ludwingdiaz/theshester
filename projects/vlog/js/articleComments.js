// frontend/js/articleComments.js

document.addEventListener('DOMContentLoaded', async () => {
    const commentForm = document.getElementById('comment-form');
    // const commentAuthor = document.getElementById('comment-author'); // Ya no es necesario si el usuario está logueado
    const commentText = document.getElementById('comment-text');
    const commentMessage = document.getElementById('comment-message');
    const commentsList = document.getElementById('comments-list');
    const commentsCount = document.getElementById('comments-count'); // Para mostrar el contador

    // Obtener el ID del artículo desde el atributo data-article-id del body
    const articleId = document.body.dataset.articleId;

    // Redirigir si no hay ID de artículo (esto no debería pasar si el HTML está bien)
    if (!articleId) {
        console.error('Error: No se encontró el ID del artículo.');
        return;
    }

    const token = localStorage.getItem('jwtToken'); // Obtener el token del almacenamiento local

    // Función auxiliar para mostrar mensajes
    function showMessage(element, message, isError = false) {
        element.textContent = message;
        element.style.color = isError ? 'red' : 'green';
        element.style.display = 'block';
        setTimeout(() => {
            element.textContent = '';
            element.style.display = 'none';
        }, 3000);
    }

    // --- Función para cargar y mostrar los comentarios del artículo ---
    async function loadArticleComments() {
        commentsList.innerHTML = '<p>Cargando comentarios...</p>'; // Mensaje de carga

        try {
            // Petición GET para obtener comentarios de este artículo específico
            const response = await fetch(`http://localhost:3000/api/comments/article/${articleId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // No necesitas Authorization si los comentarios públicos no lo requieren
                    // Si los comentarios solo se ven logueado, entonces sí:
                    // 'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                commentsCount.textContent = data.comments.length; // Actualizar el contador
                if (data.comments.length === 0) {
                    commentsList.innerHTML = '<p>Aún no hay comentarios para este artículo. ¡Sé el primero!</p>';
                } else {
                    commentsList.innerHTML = ''; // Limpiar el mensaje de carga
                    data.comments.forEach(comment => {
                        const commentElement = document.createElement('div');
                        commentElement.className = 'comment-item'; // Puedes usar una clase para estilizar
                        const date = new Date(comment.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric', month: 'long', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        });
                        commentElement.innerHTML = `
                            <p class="comment-text">"${comment.text}"</p>
                            <p class="comment-meta">Por: <strong>${comment.username}</strong> el ${date}</p>
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

    // --- Manejar el envío del formulario de comentarios ---
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evitar el envío por defecto del formulario

        if (!token) {
            showMessage(commentMessage, 'Debes iniciar sesión para comentar.', true);
            setTimeout(() => { window.location.href = 'login.html'; }, 1500);
            return;
        }

        const commentContent = commentText.value.trim();
        if (!commentContent) {
            showMessage(commentMessage, 'El comentario no puede estar vacío.', true);
            return;
        }

        try {
            // Petición POST para añadir un comentario al artículo específico
            const response = await fetch(`http://localhost:3000/api/comments/article/${articleId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Incluye el token JWT
                },
                body: JSON.stringify({ text: commentContent }) // Envía el texto del comentario
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
                showMessage(commentMessage, `Error de autorización: ${errorData.message}`, true);
                localStorage.removeItem('jwtToken'); // Eliminar token inválido
                setTimeout(() => { window.location.href = 'login.html'; }, 1500);
            } else {
                showMessage(commentMessage, 'Error desconocido al publicar el comentario.', true);
            }

        } catch (error) {
            console.error('Error de red al publicar comentario:', error);
            showMessage(commentMessage, 'Error de conexión con el servidor al publicar comentario.', true);
        }
    });

    // --- Cargar los comentarios al cargar la página ---
    loadArticleComments();
});