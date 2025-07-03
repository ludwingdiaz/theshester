// js/comments-handler.js

document.addEventListener('DOMContentLoaded', async () => {
    const commentsListContainer = document.getElementById('comments-list-container');
    const commentsList = document.getElementById('comments-list');
    const commentForm = document.getElementById('comment-form');
    const commentAuthorInput = document.getElementById('comment-author');
    const commentTextInput = document.getElementById('comment-text');
    const commentMessage = document.getElementById('comment-message'); // Para mensajes de éxito/error

    // Obtener el slug del artículo de la URL actual
    // Ejemplo: /tutoriales/generador-contrasenas.html -> generador-contrasenas
    const pathSegments = window.location.pathname.split('/');
    const articleFilename = pathSegments[pathSegments.length - 1];
    const articleSlug = articleFilename.split('.')[0]; // Elimina la extensión .html

    // Función para obtener y mostrar comentarios
    async function loadComments() {
        commentsList.innerHTML = '<p>Cargando comentarios...</p>'; // Mostrar mensaje de carga
        try {
            // Reemplaza '/api/comments' con la URL REAL de tu Serverless Function GET
            const response = await fetch(`/api/comments?articleSlug=${articleSlug}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const comments = await response.json();

            commentsList.innerHTML = ''; // Limpiar el mensaje de carga

            if (comments.length === 0) {
                commentsList.innerHTML = '<p>Sé el primero en dejar un comentario.</p>';
            } else {
                comments.forEach(comment => {
                    const commentDiv = document.createElement('div');
                    commentDiv.classList.add('comment-item'); // Clase para estilizar cada comentario
                    
                    const authorPara = document.createElement('p');
                    authorPara.classList.add('comment-author');
                    authorPara.textContent = comment.author;

                    const datePara = document.createElement('p');
                    datePara.classList.add('comment-date');
                    const date = new Date(comment.timestamp);
                    datePara.textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

                    const textPara = document.createElement('p');
                    textPara.classList.add('comment-text');
                    textPara.textContent = comment.commentText;

                    commentDiv.appendChild(authorPara);
                    commentDiv.appendChild(datePara);
                    commentDiv.appendChild(textPara);
                    commentsList.appendChild(commentDiv);
                });
            }
            // Actualizar el título de la sección con el número de comentarios
            commentsListContainer.querySelector('h3').textContent = `Comentarios (${comments.length})`;

        } catch (error) {
            console.error('Error cargando comentarios:', error);
            commentsList.innerHTML = '<p style="color: red;">No se pudieron cargar los comentarios. Intenta de nuevo más tarde.</p>';
        }
    }

    // Función para manejar el envío de un nuevo comentario
    if (commentForm) {
        commentForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevenir el envío por defecto del formulario

            const author = commentAuthorInput.value.trim();
            const commentText = commentTextInput.value.trim();

            if (!author || !commentText) {
                commentMessage.textContent = 'Por favor, rellena todos los campos.';
                commentMessage.style.color = 'red';
                return;
            }

            commentMessage.textContent = 'Enviando comentario...';
            commentMessage.style.color = 'orange';

            try {
                // Reemplaza '/api/comments' con la URL REAL de tu Serverless Function POST
                const response = await fetch('/api/comments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        articleSlug: articleSlug,
                        author: author,
                        commentText: commentText,
                        timestamp: new Date().toISOString(), // Usar ISO string para consistencia
                        approved: true // O false si quieres moderar
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                commentMessage.textContent = '¡Comentario enviado con éxito!';
                commentMessage.style.color = 'green';
                
                // Limpiar el formulario
                commentAuthorInput.value = '';
                commentTextInput.value = '';

                // Recargar los comentarios para mostrar el nuevo
                await loadComments();

            } catch (error) {
                console.error('Error al enviar comentario:', error);
                commentMessage.textContent = 'Error al enviar comentario. Intenta de nuevo.';
                commentMessage.style.color = 'red';
            }
        });
    }

    // Cargar comentarios al cargar la página
    await loadComments();
});