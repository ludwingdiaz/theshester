// frontend/projects/forms/js/diario.js

document.addEventListener('DOMContentLoaded', async () => {
    const usernameDisplay = document.getElementById('usernameDisplay');
    const fetchProtectedDataButton = document.getElementById('fetchProtectedData');
    const protectedMessage = document.getElementById('protectedMessage');
    const commentsListDiv = document.getElementById('commentsList');

    const token = localStorage.getItem('jwtToken');
    const usernameFromLocalStorage = localStorage.getItem('username');

    // --- Lógica de protección de ruta para diario.html ---
    if (!token || !usernameFromLocalStorage) {
        alert('Necesitas iniciar sesión para acceder a tu diario personal.');
        window.location.href = '/projects/forms/login.html';
        return;
    }

    usernameDisplay.textContent = usernameFromLocalStorage || 'Usuario';
    console.log("Usuario logueado en Diario:", usernameFromLocalStorage);

    const logoutHeaderButton = document.getElementById('logoutButton'); 
    if (logoutHeaderButton) {
        logoutHeaderButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            alert('Sesión cerrada correctamente.'); 
            window.location.href = '/projects/vlog/html/tutoriales.html';
        });
    }

    // --- Cargar datos protegidos (¡DESCOMENTADO!) ---
    if (fetchProtectedDataButton) {
        fetchProtectedDataButton.disabled = false; // Habilitar el botón
        protectedMessage.textContent = ''; // Limpiar mensaje de deshabilitado
        fetchProtectedDataButton.addEventListener('click', async () => {
            if (!protectedMessage) {
                console.warn("Elemento protectedMessage no encontrado.");
                return;
            }
            protectedMessage.textContent = 'Cargando...';
            try {
                const response = await fetch('http://localhost:3000/api/protected-data', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    protectedMessage.style.color = 'green';
                    protectedMessage.textContent = `Datos protegidos: ${data.data?.username ? `para ${data.data.username}` : ''}. Role: ${data.data?.role}. Secret: ${data.data?.secretInfo}`;

                } else if (response.status === 401 || response.status === 403) {
                    const errorData = await response.json();
                    protectedMessage.style.color = 'red';
                    protectedMessage.textContent = `Error: ${errorData.message || 'Autorización fallida'}. Redirigiendo a login.`;
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('username');
                    setTimeout(() => { window.location.href = '/projects/forms/login.html'; }, 1500);
                } else {
                    protectedMessage.style.color = 'red';
                    const errorData = await response.json();
                    protectedMessage.textContent = `Error al cargar datos protegidos: ${errorData.message || response.statusText}`;
                    console.error('Error al cargar datos protegidos:', errorData);
                }
            } catch (error) {
                console.error('Error de red:', error);
                protectedMessage.style.color = 'red';
                protectedMessage.textContent = 'Error de conexión al cargar datos protegidos.';
            }
        });
    }

    // --- Función para cargar y mostrar los comentarios del usuario (¡DESCOMENTADO!) ---
    if (commentsListDiv) {
        async function loadUserComments() {
            commentsListDiv.innerHTML = '<p>Cargando tus comentarios...</p>';
            try {
                const response = await fetch('http://localhost:3000/api/comments/my-comments', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.comments && data.comments.length > 0) {
                        commentsListDiv.innerHTML = '';
                        data.comments.forEach(comment => {
                            const commentElement = document.createElement('div');
                            commentElement.className = 'comment-item';
                            const date = new Date(comment.createdAt).toLocaleDateString('es-ES', {
                                year: 'numeric', month: 'long', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            });
                            commentElement.innerHTML = `
                                <p class="comment-text">"${comment.text}"</p>
                                <p class="comment-meta">Artículo: <strong>${comment.articleId}</strong> - Publicado: ${date}</p>
                                <p class="comment-meta">ID de Comentario: ${comment._id}</p>
                            `;
                            commentsListDiv.appendChild(commentElement);
                        });
                    } else {
                        commentsListDiv.innerHTML = '<p>Aún no has publicado ningún comentario.</p>';
                    }
                } else if (response.status === 401 || response.status === 403) {
                    const errorData = await response.json();
                    commentsListDiv.innerHTML = `<p style="color:red;">Error de autorización al cargar comentarios: ${errorData.message || 'Token inválido/expirado'}. Redirigiendo a login.</p>`;
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('username');
                    setTimeout(() => { window.location.href = '/projects/forms/login.html'; }, 1500);
                } else {
                    const errorData = await response.json();
                    commentsListDiv.innerHTML = `<p style="color:red;">Error al cargar tus comentarios: ${errorData.message || response.statusText}</p>`;
                    console.error('Error al cargar comentarios:', errorData);
                }
            } catch (error) {
                console.error('Error de red al cargar comentarios del usuario:', error);
                commentsListDiv.innerHTML = '<p style="color:red;">Error de conexión con el servidor al cargar tus comentarios.</p>';
            }
        }
        loadUserComments();
    }
});