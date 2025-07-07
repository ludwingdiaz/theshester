document.addEventListener('DOMContentLoaded', async () => {
    // Referencias a los elementos del DOM (IDs de la dashboard)
    const usernameDisplaySidebar = document.getElementById('usernameDisplaySidebar');
    const userEmailDisplaySidebar = document.getElementById('userEmailDisplaySidebar');
    const usernameDisplayMain = document.getElementById('usernameDisplayMain');
    // const userBioDisplayMain = document.getElementById('userBioDisplayMain'); // Eliminada o comentada esta línea
    const messageBox = document.getElementById('messageBox');

    // Navegación de la sidebar
    const visionGeneralLink = document.getElementById('visionGeneralLink');
    const editProfileLink = document.getElementById('editProfileLink');
    const securityLink = document.getElementById('securityLink');
    const misComentariosLink = document.getElementById('misComentariosLink');

    // Secciones de contenido dinámico (ASEGÚRATE QUE ESTOS IDs EXISTEN EN TU HTML)
    const profileOverviewSection = document.getElementById('profile-overview-section');
    const commentsSection = document.getElementById('comments-section'); // Esta es la sección donde se muestran los comentarios
    const protectedDataSection = document.getElementById('protected-data-section');
    const editProfileSection = document.getElementById('edit-profile-section'); // NUEVA SECCIÓN PARA EDITAR PERFIL
    
    // Elementos específicos de las secciones
    const commentsListDiv = document.getElementById('commentsList'); // Contenedor para la lista de comentarios
    const fetchProtectedDataButton = document.getElementById('fetchProtectedData');
    const protectedMessage = document.getElementById('protectedMessage');

    // Elementos del formulario de edición de perfil (NUEVOS)
    const editProfileForm = document.getElementById('editProfileForm');
    const editUsernameInput = document.getElementById('editUsername');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const editProfileMessage = document.getElementById('editProfileMessage');


    const BASE_URL_BACKEND = 'http://localhost:3000';
    console.log(`diario.js: Conectando al backend en: ${BASE_URL_BACKEND}`);

    // Función para mostrar mensajes (centralizada)
    function showMessage(message, type = 'success') {
        if (messageBox) {
            messageBox.textContent = message;
            messageBox.className = `message-box ${type}`;
            messageBox.style.display = 'block';
            setTimeout(() => {
                messageBox.style.display = 'none';
            }, 5000);
        }
    }

    // --- Lógica de protección de ruta para diario.ejs ---
    // Obtener token y userId aquí para asegurar que estén actualizados
    let token = localStorage.getItem('jwtToken');
    let usernameFromLocalStorage = localStorage.getItem('username');
    let userIdFromLocalStorage = localStorage.getItem('userId'); // Obtener userId aquí
    let userEmailFromLocalStorage = localStorage.getItem('userEmail'); // Obtener userEmail aquí

    // CONSOLE.LOG DE DEPURACIÓN EN EL INICIO DE diario.js
    console.log('diario.js: Valor de userId en localStorage al inicio:', userIdFromLocalStorage);

    if (!token || !usernameFromLocalStorage || !userIdFromLocalStorage) {
        showMessage('Necesitas iniciar sesión para acceder a tu perfil.', 'error');
        localStorage.clear(); // Limpiar por si hay datos inconsistentes
        window.location.href = `${BASE_URL_BACKEND}/projects/forms/login.html`;
        return;
    }

    // Llenar los campos con la información del usuario del localStorage
    if (usernameDisplaySidebar) usernameDisplaySidebar.textContent = usernameFromLocalStorage || 'Usuario';
    if (userEmailDisplaySidebar) userEmailDisplaySidebar.textContent = userEmailFromLocalStorage || 'usuario@ejemplo.com';
    if (usernameDisplayMain) usernameDisplayMain.textContent = usernameFromLocalStorage || 'Usuario';
    // if (userBioDisplayMain) userBioDisplayMain.textContent = userBioFromLocalStorage; // <--- ¡LÍNEA ELIMINADA O COMENTADA!


    // Lógica del botón de cerrar sesión (para el header)
    const logoutHeaderButton = document.getElementById('logoutButton'); 
    if (logoutHeaderButton) {
        logoutHeaderButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear(); // Limpia todo el almacenamiento local
            showMessage('Sesión cerrada correctamente.', 'success'); 
            window.location.href = `${BASE_URL_BACKEND}/tutoriales`; // Redirige al home
        });
    }

    // --- Funciones para cargar contenido dinámico ---

    // Función para mostrar solo una sección y ocultar las demás
    function showSection(sectionToShow) {
        // Incluye todas las secciones principales de contenido
        [profileOverviewSection, commentsSection, protectedDataSection, editProfileSection].forEach(section => {
            if (section) {
                section.style.display = 'none';
            }
        });
        if (sectionToShow) {
            sectionToShow.style.display = 'block';
        }
    }

    // Cargar las últimas 10 entradas/comentarios (para Visión General)
    async function loadOverviewComments() {
        // Re-obtener userId aquí para asegurar el valor más reciente
        const currentUserId = localStorage.getItem('userId'); 
        // CONSOLE.LOG DE DEPURACIÓN ANTES DEL FETCH DE OVERVIEW
        console.log('loadOverviewComments: Valor de userId justo antes del fetch:', currentUserId);

        if (!commentsListDiv) {
            console.error("Elemento commentsListDiv no encontrado.");
            return;
        }

        if (!currentUserId) {
            commentsListDiv.innerHTML = '<p style="color:red;">Error: ID de usuario no disponible para la visión general. Por favor, recargue o inicie sesión de nuevo.</p>';
            showMessage('Error: ID de usuario no disponible para la visión general.', 'error');
            return;
        }

        commentsListDiv.innerHTML = '<p>Cargando tus últimas entradas...</p>';
        showSection(profileOverviewSection);
        // Asegurarse de que la sección de comentarios esté visible dentro del overview si es necesario
        if (commentsSection) commentsSection.style.display = 'block'; 
        if (protectedDataSection) protectedDataSection.style.display = 'none';
        if (editProfileSection) editProfileSection.style.display = 'none'; // Asegurarse de que la sección de edición esté oculta

        try {
            const response = await fetch(`${BASE_URL_BACKEND}/api/comments/user/${currentUserId}?limit=10`, {
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
                    commentsListDiv.innerHTML = '<p>No tienes comentarios recientes.</p>';
                }
            } else if (response.status === 401 || response.status === 403) {
                const errorData = await response.json();
                commentsListDiv.innerHTML = `<p style="color:red;">Error de autorización: ${errorData.message || 'Token inválido/expirado'}.</p>`;
                showMessage(`Error: ${errorData.message || 'Autorización fallida'}. Redirigiendo a login.`, 'error');
                localStorage.clear();
                setTimeout(() => { window.location.href = `${BASE_URL_BACKEND}/projects/forms/login.html`; }, 1500);
            } else {
                const errorData = await response.json();
                commentsListDiv.innerHTML = `<p style="color:red;">Error al cargar tus últimas entradas: ${errorData.message || response.statusText}</p>`;
                showMessage(`Error al cargar tus últimas entradas: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error('Error de red al cargar últimas entradas:', error);
            commentsListDiv.innerHTML = '<p style="color:red;">Error de conexión con el servidor.</p>';
            showMessage('Error de conexión con el servidor.', 'error');
        }
    }

    // Cargar TODOS los comentarios del usuario (para Mis Comentarios)
    async function loadAllUserComments() {
        // Re-obtener userId aquí para asegurar el valor más reciente
        const currentUserId = localStorage.getItem('userId');
        // CONSOLE.LOG DE DEPURACIÓN ANTES DEL FETCH DE TODOS LOS COMENTARIOS
        console.log('loadAllUserComments: Valor de userId justo antes del fetch:', currentUserId);

        if (!commentsListDiv) {
            console.error("Elemento commentsListDiv no encontrado.");
            return;
        }

        if (!currentUserId) {
            commentsListDiv.innerHTML = '<p style="color:red;">Error: ID de usuario no disponible para todos los comentarios. Por favor, recargue o inicie sesión de nuevo.</p>';
            showMessage('Error: ID de usuario no disponible para todos los comentarios.', 'error');
            return;
        }

        commentsListDiv.innerHTML = '<p>Cargando todos tus comentarios...</p>';
        showSection(commentsSection);
        // Asegurarse de que las otras secciones estén ocultas
        if (profileOverviewSection) profileOverviewSection.style.display = 'none'; 
        if (protectedDataSection) protectedDataSection.style.display = 'none';
        if (editProfileSection) editProfileSection.style.display = 'none'; // Asegurarse de que la sección de edición esté oculta

        try {
            const response = await fetch(`${BASE_URL_BACKEND}/api/comments/user/${currentUserId}`, { // Sin límite
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
                commentsListDiv.innerHTML = `<p style="color:red;">Error de autorización: ${errorData.message || 'Token inválido/expirado'}.</p`;
                showMessage(`Error: ${errorData.message || 'Autorización fallida'}. Redirigiendo a login.`, 'error');
                localStorage.clear();
                setTimeout(() => { window.location.href = `${BASE_URL_BACKEND}/projects/forms/login.html`; }, 1500);
            } else {
                const errorData = await response.json();
                commentsListDiv.innerHTML = `<p style="color:red;">Error al cargar todos tus comentarios: ${errorData.message || response.statusText}</p>`;
                showMessage(`Error al cargar todos tus comentarios: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error('Error de red al cargar todos los comentarios:', error);
            commentsListDiv.innerHTML = '<p style="color:red;">Error de conexión con el servidor.</p>';
            showMessage('Error de conexión con el servidor.', 'error');
        }
    }

    // Cargar datos protegidos
    async function loadProtectedData() {
        if (!protectedMessage) {
            console.warn("Elemento protectedMessage no encontrado.");
            return;
        }
        protectedMessage.textContent = 'Cargando...';
        showSection(protectedDataSection);
        if (profileOverviewSection) profileOverviewSection.style.display = 'none'; 
        if (commentsSection) commentsSection.style.display = 'none';
        if (editProfileSection) editProfileSection.style.display = 'none'; // Asegurarse de que la sección de edición esté oculta

        try {
            const response = await fetch(`${BASE_URL_BACKEND}/api/protected-data`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                protectedMessage.style.color = 'green';
                protectedMessage.textContent = `Datos protegidos: ${data.data?.username ? `para ${data.data.username}` : ''}. Role: ${data.data?.role}. Secret: ${data.data?.secretInfo}`;
                showMessage('Datos protegidos cargados con éxito.', 'success');
            } else if (response.status === 401 || response.status === 403) {
                const errorData = await response.json();
                protectedMessage.style.color = 'red';
                protectedMessage.textContent = `Error: ${errorData.message || 'Autorización fallida'}. Redirigiendo a login.`;
                showMessage(`Error: ${errorData.message || 'Autorización fallida'}. Redirigiendo a login.`, 'error');
                localStorage.clear();
                setTimeout(() => { window.location.href = `${BASE_URL_BACKEND}/projects/forms/login.html`; }, 1500);
            } else {
                protectedMessage.style.color = 'red';
                const errorData = await response.json();
                protectedMessage.textContent = `Error al cargar datos protegidos: ${errorData.message || response.statusText}`;
                console.error('Error al cargar datos protegidos:', errorData);
                showMessage(`Error al cargar datos protegidos: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error('Error de red:', error);
            protectedMessage.style.color = 'red';
            protectedMessage.textContent = 'Error de conexión al cargar datos protegidos.';
            showMessage('Error de conexión al cargar datos protegidos.', 'error');
        }
    }

    // --- NUEVA FUNCIÓN: Cargar y mostrar el formulario de edición de perfil ---
    async function loadEditProfileForm() {
        showSection(editProfileSection); // Mostrar la nueva sección de edición
        
        // Cargar el nombre de usuario actual en el campo del formulario
        const username = localStorage.getItem('username');
        if (editUsernameInput && username) {
            editUsernameInput.value = username;
        }

        // Limpiar los campos de contraseña y mensajes anteriores
        if (currentPasswordInput) currentPasswordInput.value = '';
        if (newPasswordInput) newPasswordInput.value = '';
        if (confirmNewPasswordInput) confirmNewPasswordInput.value = '';
        if (editProfileMessage) {
            editProfileMessage.textContent = '';
            editProfileMessage.style.display = 'none';
        }
    }

    // --- NUEVA FUNCIÓN: Manejar el envío del formulario de edición de perfil ---
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const newUsername = editUsernameInput.value.trim();
            const currentPassword = currentPasswordInput.value;
            const newPassword = newPasswordInput.value;
            const confirmNewPassword = confirmNewPasswordInput.value;

            // Validaciones básicas del lado del cliente
            if (!newUsername || !currentPassword) {
                editProfileMessage.textContent = 'El nombre de usuario y la contraseña actual son requeridos.';
                editProfileMessage.className = 'message-box error';
                editProfileMessage.style.display = 'block';
                return;
            }

            if (newPassword) { // Si se proporciona una nueva contraseña
                if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
                    editProfileMessage.textContent = 'La nueva contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.';
                    editProfileMessage.className = 'message-box error';
                    editProfileMessage.style.display = 'block';
                    return;
                }
                if (newPassword !== confirmNewPassword) {
                    editProfileMessage.textContent = 'La nueva contraseña y la confirmación no coinciden.';
                    editProfileMessage.className = 'message-box error';
                    editProfileMessage.style.display = 'block';
                    return;
                }
            }

            editProfileMessage.textContent = 'Guardando cambios...';
            editProfileMessage.className = 'message-box info';
            editProfileMessage.style.display = 'block';

            const token = localStorage.getItem('jwtToken');
            const userId = localStorage.getItem('userId'); // Asegúrate de que userId esté disponible

            try {
                // La URL debe coincidir con la ruta PUT en tu backend (ej. /api/auth/profile/:userId)
                const response = await fetch(`${BASE_URL_BACKEND}/api/auth/profile/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        username: newUsername,
                        currentPassword: currentPassword,
                        newPassword: newPassword // Se enviará solo si se proporcionó
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    editProfileMessage.textContent = data.message || 'Perfil actualizado exitosamente.';
                    editProfileMessage.className = 'message-box success';
                    editProfileMessage.style.display = 'block';
                    
                    // Actualizar localStorage si el nombre de usuario cambió
                    if (newUsername !== localStorage.getItem('username')) {
                        localStorage.setItem('username', newUsername);
                        if (usernameDisplaySidebar) usernameDisplaySidebar.textContent = newUsername;
                        if (usernameDisplayMain) usernameDisplayMain.textContent = newUsername;
                    }

                    // Limpiar campos de contraseña después de un éxito
                    if (currentPasswordInput) currentPasswordInput.value = '';
                    if (newPasswordInput) newPasswordInput.value = '';
                    if (confirmNewPasswordInput) confirmNewPasswordInput.value = '';

                    // Opcional: Recargar la información general o simplemente dejar el mensaje de éxito
                    // loadOverviewComments(); 

                } else if (response.status === 401 || response.status === 403) {
                    editProfileMessage.textContent = `Error de autorización: ${data.message || 'Token inválido/expirado'}. Redirigiendo a login.`;
                    editProfileMessage.className = 'message-box error';
                    editProfileMessage.style.display = 'block';
                    localStorage.clear();
                    setTimeout(() => { window.location.href = `${BASE_URL_BACKEND}/projects/forms/login.html`; }, 1500);
                } else {
                    editProfileMessage.textContent = data.message || 'Error al actualizar el perfil.';
                    editProfileMessage.className = 'message-box error';
                    editProfileMessage.style.display = 'block';
                }
            } catch (error) {
                console.error('Error de red al actualizar perfil:', error);
                editProfileMessage.textContent = 'Error de conexión con el servidor al actualizar perfil.';
                editProfileMessage.className = 'message-box error';
                editProfileMessage.style.display = 'block';
            }
        });
    }


    // --- Lógica de eventos para la navegación de la sidebar ---

    // Inicialmente, cargar la visión general al cargar la página
    if (visionGeneralLink) {
        visionGeneralLink.classList.add('active'); // Marcar como activo por defecto
        loadOverviewComments(); // Cargar la vista general
    } else {
        // Fallback si no existe el link, asegurar que al menos la sección de overview se muestre
        showSection(profileOverviewSection);
        if (commentsSection) commentsSection.style.display = 'block'; // Asegura que la subsección de comentarios se vea en overview
        loadOverviewComments(); // Carga los comentarios aunque no haya link de nav
    }


    if (visionGeneralLink) {
        visionGeneralLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Remover 'active' de todos los enlaces y añadirlo al actual
            document.querySelectorAll('.profile-nav-item').forEach(link => link.classList.remove('active'));
            visionGeneralLink.classList.add('active');
            loadOverviewComments();
        });
    }

    // Para Editar Perfil, ahora carga el formulario en la misma página
    if (editProfileLink) {
        editProfileLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Remover 'active' de todos los enlaces y añadirlo al actual
            document.querySelectorAll('.profile-nav-item').forEach(link => link.classList.remove('active'));
            editProfileLink.classList.add('active');
            loadEditProfileForm(); // Llama a la nueva función para cargar el formulario
            showMessage('Editando tu perfil...', 'info'); // Mensaje informativo
        });
    }

    // Para Seguridad, simplemente redirigimos (o cargar un formulario de cambio de contraseña)
    if (securityLink) {
        securityLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Remover 'active' de todos los enlaces y añadirlo al actual
            document.querySelectorAll('.profile-nav-item').forEach(link => link.classList.remove('active'));
            securityLink.classList.add('active');
            // Aquí podrías cargar un formulario de cambio de contraseña/seguridad o simplemente mostrar datos protegidos
            // Vamos a mostrar los datos protegidos aquí por simplicidad, usando la función existente
            loadProtectedData(); 
            showMessage('Mostrando información de seguridad (datos protegidos)...', 'info');
        });
    }

    if (misComentariosLink) {
        misComentariosLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Remover 'active' de todos los enlaces y añadirlo al actual
            document.querySelectorAll('.profile-nav-item').forEach(link => link.classList.remove('active'));
            misComentariosLink.classList.add('active');
            loadAllUserComments();
        });
    }

    // El botón de "Cargar mis datos (Protegido)" dentro de la sección de Datos Protegidos
    // Esto asegura que si el botón existe y se hace clic en él, también carga los datos protegidos
    if (fetchProtectedDataButton) {
        fetchProtectedDataButton.addEventListener('click', loadProtectedData);
    }
});
