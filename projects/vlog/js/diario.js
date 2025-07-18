document.addEventListener('DOMContentLoaded', async () => {
    // Referencias a los elementos del DOM (IDs de la dashboard)
    const usernameDisplaySidebar = document.getElementById('usernameDisplaySidebar');
    const userEmailDisplaySidebar = document.getElementById('userEmailDisplaySidebar');
    const usernameDisplayMain = document.getElementById('usernameDisplayMain');
    const messageBox = document.getElementById('messageBox');
    const usernameDisplayHeader = document.getElementById('usernameDisplayHeader'); // Para el nombre en el header

    // Navegación de la sidebar
    const visionGeneralLink = document.getElementById('visionGeneralLink');
    const editProfileLink = document.getElementById('editProfileLink');
    const securityLink = document.getElementById('securityLink');
    const misComentariosLink = document.getElementById('misComentariosLink');
    const editProfileMainBtn = document.getElementById('editProfileMainBtn'); // Botón "Editar Perfil" en la sección de visión general

    // Secciones de contenido dinámico (ASEGÚRATE QUE ESTOS IDs EXISTEN EN TU HTML diario.ejs)
    const profileOverviewSection = document.getElementById('profile-overview-section');
    const commentsSection = document.getElementById('comments-section'); // Esta es la sección donde se muestran TODOS los comentarios
    const protectedDataSection = document.getElementById('protected-data-section');
    const editProfileSection = document.getElementById('edit-profile-section'); // Sección para editar perfil
    
    // Elementos específicos de las secciones de comentarios
    const commentsListOverview = document.getElementById('commentsListOverview'); // Contenedor para la lista de comentarios en VISIÓN GENERAL (limitado a 10)
    const commentsListAll = document.getElementById('commentsListAll'); // Contenedor para la lista de TODOS los comentarios (en "Mis Comentarios")
    
    // Elementos para la sección de datos protegidos
    const fetchProtectedDataButton = document.getElementById('fetchProtectedData');
    const protectedMessage = document.getElementById('protectedMessage');

    // Elementos del formulario de edición de perfil
    const editProfileForm = document.getElementById('editProfileForm');
    const editUsernameInput = document.getElementById('editUsername');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const editProfileMessage = document.getElementById('editProfileMessage');

    // NUEVAS REFERENCIAS: Elementos de las estadísticas
    const commentsPublishedDisplay = document.querySelector('#profile-overview-section .profile-stats-grid .stat-card:nth-child(1) .stat-value');
    const lastActivityDisplay = document.querySelector('#profile-overview-section .profile-stats-grid .stat-card:nth-child(2) .stat-value');
    const articlesViewedDisplay = document.querySelector('#profile-overview-section .profile-stats-grid .stat-card:nth-child(3) .stat-value');


    // URL base de tu backend
    const BASE_URL_BACKEND = 'https://tutorial-views-api.onrender.com';
    console.log(`diario.js: Conectando al backend en: ${BASE_URL_BACKEND}`);

    // Función para mostrar mensajes (centralizada para feedback al usuario)
    function showMessage(message, type = 'success') {
        if (messageBox) {
            messageBox.textContent = message;
            messageBox.className = `message-box ${type}`; // Aplica clases para estilo (ej. success, error, info)
            messageBox.style.display = 'block';
            setTimeout(() => {
                messageBox.style.display = 'none';
            }, 5000); // Oculta el mensaje después de 5 segundos
        }
    }

    // Función para actualizar los elementos del nombre de usuario en la interfaz
    function updateUsernameDisplays(username) {
        if (usernameDisplaySidebar) usernameDisplaySidebar.textContent = username;
        if (usernameDisplayMain) usernameDisplayMain.textContent = username;
        if (editUsernameInput) editUsernameInput.value = username; // Pre-rellena el campo de edición
        if (usernameDisplayHeader) usernameDisplayHeader.textContent = username; // Actualiza el nombre en el header
    }

    // Función para actualizar el email en la interfaz
    function updateEmailDisplay(email) {
        if (userEmailDisplaySidebar) userEmailDisplaySidebar.textContent = email;
    }

    // Función para cargar los datos del perfil (al cargar la página y verificar autenticación)
    async function loadUserProfile() {
        let token = localStorage.getItem('jwtToken'); // Obtiene el token JWT del almacenamiento local
        let usernameFromLocalStorage = localStorage.getItem('username');
        let userIdFromLocalStorage = localStorage.getItem('userId');
        let userEmailFromLocalStorage = localStorage.getItem('userEmail');

        console.log('diario.js: Valor de userId en localStorage al inicio:', userIdFromLocalStorage);

        // Si no hay token, nombre de usuario o ID de usuario, redirige al login
        if (!token || !usernameFromLocalStorage || !userIdFromLocalStorage) {
            showMessage('Necesitas iniciar sesión para acceder a tu perfil.', 'error');
            localStorage.clear(); // Limpia datos inconsistentes
            window.location.href = `${BASE_URL_BACKEND}/projects/forms/login.html`;
            return;
        }

        // Llenar los campos de la interfaz con la información del usuario del localStorage
        updateUsernameDisplays(usernameFromLocalStorage);
        updateEmailDisplay(userEmailFromLocalStorage);

        // Opcional: Podrías hacer un fetch aquí para obtener datos de perfil más actualizados
        // desde el backend si la información en localStorage pudiera estar desactualizada.
        // Por ahora, usamos localStorage directamente para evitar llamadas API innecesarias al inicio.
    }

    // Lógica de protección de ruta y carga inicial (se ejecuta al cargar el script)
    await loadUserProfile(); // Asegura que el perfil del usuario se cargue y se verifique la autenticación

    // Lógica del botón de cerrar sesión (para el header)
    const logoutHeaderButton = document.getElementById('logoutButton'); 
    if (logoutHeaderButton) {
        logoutHeaderButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear(); // Limpia todo el almacenamiento local (token, username, etc.)
            showMessage('Sesión cerrada correctamente.', 'success'); 
            window.location.href = `${BASE_URL_BACKEND}/tutoriales`; // Redirige al home o a la página de inicio
        });
    }

    // Función para mostrar solo una sección de contenido y ocultar las demás
    function showSection(sectionToShow) {
        // Oculta todas las secciones principales de contenido
        [profileOverviewSection, commentsSection, protectedDataSection, editProfileSection].forEach(section => {
            if (section) {
                section.style.display = 'none';
            }
        });
        // Muestra la sección deseada
        if (sectionToShow) {
            sectionToShow.style.display = 'block';
        }

        // Actualizar la clase 'active' en los elementos de navegación del sidebar
        const navItems = document.querySelectorAll('.profile-sub-nav .profile-nav-item');
        navItems.forEach(item => item.classList.remove('active'));

        if (sectionToShow === profileOverviewSection && visionGeneralLink) {
            visionGeneralLink.classList.add('active');
        } else if (sectionToShow === editProfileSection && editProfileLink) {
            editProfileLink.classList.add('active');
        } else if (sectionToShow === commentsSection && misComentariosLink) {
            misComentariosLink.classList.add('active');
        } else if (sectionToShow === protectedDataSection && securityLink) {
            securityLink.classList.add('active');
        }
    }

    // Función unificada para cargar comentarios (se usa para Visión General y Todos Mis Comentarios)
    async function loadComments(targetElement, limit = null) {
        const currentUserId = localStorage.getItem('userId');
        const token = localStorage.getItem('jwtToken');

        console.log(`loadComments: Valor de userId justo antes del fetch para ${limit ? 'overview' : 'todos'}:`, currentUserId);

        // Verifica que el elemento DOM de destino exista
        if (!targetElement) {
            console.error(`Elemento ${targetElement === commentsListOverview ? 'commentsListOverview' : 'commentsListAll'} no encontrado.`);
            return;
        }

        // Verifica que el ID de usuario y el token estén disponibles
        if (!currentUserId) {
            targetElement.innerHTML = '<p style="color:red;">Error: ID de usuario no disponible. Por favor, recargue o inicie sesión de nuevo.</p>';
            showMessage('Error: ID de usuario no disponible.', 'error');
            return;
        }
        if (!token) {
            targetElement.innerHTML = '<p style="color:red;">Error: Token de autenticación no disponible. Por favor, inicie sesión de nuevo.</p>';
            showMessage('Error: Token de autenticación no disponible.', 'error');
            return;
        }

        // Muestra un mensaje de carga
        targetElement.innerHTML = `<p>Cargando ${limit ? 'tus últimas entradas...' : 'todos tus comentarios...'}</p>`;

        try {
            let url = `${BASE_URL_BACKEND}/api/comments/user/${currentUserId}`;
            if (limit) {
                url += `?limit=${limit}`; // Añade el parámetro de límite si se especifica
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.comments && data.comments.length > 0) {
                    targetElement.innerHTML = ''; // Limpia el contenido antes de añadir nuevos comentarios
                    data.comments.forEach(comment => {
                        const commentElement = document.createElement('div');
                        commentElement.className = 'comment-item card'; // Usar clase card para estilo
                        const date = new Date(comment.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric', month: 'long', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        });
                        commentElement.innerHTML = `
                            <p class="comment-text">"${comment.text}"</p>
                            <p class="comment-meta">Artículo: <strong>${comment.articleId || 'Desconocido'}</strong> - Publicado: ${date}</p>
                            <p class="comment-meta">ID de Comentario: ${comment._id}</p>
                        `;
                        targetElement.appendChild(commentElement);
                    });
                } else {
                    targetElement.innerHTML = `<p>No tienes ${limit ? 'comentarios recientes.' : 'comentarios publicados aún.'}</p>`;
                }
            } else if (response.status === 401 || response.status === 403) {
                // Manejo de errores de autorización (token inválido/expirado)
                const errorData = await response.json();
                targetElement.innerHTML = `<p style="color:red;">Error de autorización: ${errorData.message || 'Token inválido/expirado'}.</p>`;
                showMessage(`Error: ${errorData.message || 'Autorización fallida'}. Redirigiendo a login.`, 'error');
                localStorage.clear();
                setTimeout(() => { window.location.href = `${BASE_URL_BACKEND}/projects/forms/login.html`; }, 1500);
            } else {
                // Otros errores del servidor
                const errorData = await response.json();
                targetElement.innerHTML = `<p style="color:red;">Error al cargar comentarios: ${errorData.message || response.statusText}</p>`;
                showMessage(`Error al cargar comentarios: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error('Error de red al cargar comentarios:', error);
            targetElement.innerHTML = '<p style="color:red;">Error de conexión con el servidor.</p>';
            showMessage('Error de conexión al cargar comentarios.', 'error');
        }
    }

    // NUEVA FUNCIÓN: Para cargar todos los comentarios del usuario (en la sección "Mis Comentarios")
    // Se extrae la lógica de loadComments para evitar duplicación y hacerla más específica
    async function loadAllUserComments() {
        showSection(commentsSection); // Asegúrate de que esta es la sección correcta para "Mis Comentarios"
        loadComments(commentsListAll); // Llama a la función unificada sin límite
    }

    // NUEVA FUNCIÓN: Para cargar y mostrar las estadísticas del perfil
    async function loadProfileStats() {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            console.warn('No hay token de autenticación para cargar las estadísticas del perfil.');
            return;
        }

        // Mostrar "Cargando..." mientras se obtienen los datos
        if (commentsPublishedDisplay) commentsPublishedDisplay.textContent = 'Cargando...';
        if (lastActivityDisplay) lastActivityDisplay.textContent = 'Cargando...';
        if (articlesViewedDisplay) articlesViewedDisplay.textContent = 'Cargando...';

        try {
            // Esta URL debe coincidir con la nueva ruta que añadimos en comments.js
            const response = await fetch(`${BASE_URL_BACKEND}/api/comments/user-summary`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                if (commentsPublishedDisplay) commentsPublishedDisplay.textContent = data.commentsPublished || 0;
                
                if (lastActivityDisplay) {
                    if (data.lastActivity) {
                        const date = new Date(data.lastActivity).toLocaleDateString('es-ES', {
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        });
                        lastActivityDisplay.textContent = date;
                    } else {
                        lastActivityDisplay.textContent = 'N/A'; // No hay actividad si no hay comentarios
                    }
                }
                
                if (articlesViewedDisplay) articlesViewedDisplay.textContent = data.articlesViewed || 0;

            } else if (response.status === 401 || response.status === 403) {
                const errorData = await response.json();
                console.error('Error de autorización al cargar estadísticas del perfil:', errorData.message);
                // No redirigimos aquí porque el loadUserProfile ya lo maneja al inicio
                // y no queremos interrupciones si solo fallan las estadísticas
                if (commentsPublishedDisplay) commentsPublishedDisplay.textContent = 'Error';
                if (lastActivityDisplay) lastActivityDisplay.textContent = 'Error';
                if (articlesViewedDisplay) articlesViewedDisplay.textContent = 'Error';
            } else {
                const errorData = await response.json();
                console.error('Error al cargar estadísticas del perfil:', errorData.message || response.statusText);
                if (commentsPublishedDisplay) commentsPublishedDisplay.textContent = 'Error';
                if (lastActivityDisplay) lastActivityDisplay.textContent = 'Error';
                if (articlesViewedDisplay) articlesViewedDisplay.textContent = 'Error';
            }
        } catch (error) {
            console.error('Error de red al cargar estadísticas del perfil:', error);
            // Podrías poner valores predeterminados o "Error"
            if (commentsPublishedDisplay) commentsPublishedDisplay.textContent = 'Error';
            if (lastActivityDisplay) lastActivityDisplay.textContent = 'Error';
            if (articlesViewedDisplay) articlesViewedDisplay.textContent = 'Error';
        }
    }


    // Función para cargar y mostrar datos protegidos del usuario
    async function loadProtectedData() {
        if (!protectedMessage) {
            console.warn("Elemento protectedMessage no encontrado.");
            return;
        }
        protectedMessage.textContent = 'Cargando...';
        showSection(protectedDataSection); // Muestra la sección de datos protegidos

        const token = localStorage.getItem('jwtToken');
        if (!token) {
            protectedMessage.textContent = 'No estás autenticado para acceder a datos protegidos.';
            protectedMessage.className = 'message-box error';
            protectedMessage.style.display = 'block';
            return;
        }

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

    // Función para cargar y mostrar el formulario de edición de perfil
    async function loadEditProfileForm() {
        showSection(editProfileSection); // Muestra la sección de edición de perfil
        const username = localStorage.getItem('username');
        if (editUsernameInput && username) {
            editUsernameInput.value = username; // Pre-rellena el campo de nombre de usuario
        }
        // Limpia los campos de contraseña y mensajes anteriores
        if (currentPasswordInput) currentPasswordInput.value = '';
        if (newPasswordInput) newPasswordInput.value = '';
        if (confirmNewPasswordInput) confirmNewPasswordInput.value = '';
        if (editProfileMessage) {
            editProfileMessage.textContent = '';
            editProfileMessage.style.display = 'none';
        }
    }

    // Manejar el envío del formulario de edición de perfil
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const newUsername = editUsernameInput.value.trim();
            const currentPassword = currentPasswordInput.value;
            const newPassword = newPasswordInput.value;
            const confirmNewPassword = confirmNewPasswordInput.value;

            // Validaciones del lado del cliente
            if (!newUsername || !currentPassword) {
                editProfileMessage.textContent = 'El nombre de usuario y la contraseña actual son requeridos.';
                editProfileMessage.className = 'message-box error';
                editProfileMessage.style.display = 'block';
                return;
            }

            if (newPassword) { // Si se proporciona una nueva contraseña, validarla
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
            const userId = localStorage.getItem('userId');

            try {
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
                    
                    // Actualizar localStorage y los displays del nombre de usuario si cambió
                    if (newUsername !== localStorage.getItem('username')) {
                        localStorage.setItem('username', newUsername);
                        updateUsernameDisplays(newUsername); // Actualiza todos los displays
                    }

                    // Limpiar campos de contraseña después de un éxito
                    if (currentPasswordInput) currentPasswordInput.value = '';
                    if (newPasswordInput) newPasswordInput.value = '';
                    if (confirmNewPasswordInput) confirmNewPasswordInput.value = '';

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


    // --- Lógica de eventos para la navegación de la sidebar y botones principales ---

    // Inicialmente, cargar la visión general al cargar la página
    showSection(profileOverviewSection); // Muestra la sección de visión general al inicio
    loadComments(commentsListOverview, 5); // Carga los 10 últimos comentarios para la visión general
    loadProfileStats(); // <--- ¡NUEVA LLAMADA A LA FUNCIÓN DE ESTADÍSTICAS AL CARGAR!

    // Event listener para el enlace "Visión General"
    if (visionGeneralLink) {
        visionGeneralLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Remover 'active' de todos los enlaces y añadirlo al actual
            document.querySelectorAll('.profile-nav-item').forEach(link => link.classList.remove('active'));
            visionGeneralLink.classList.add('active');
            showSection(profileOverviewSection); // Asegúrate de mostrar la sección
            loadComments(commentsListOverview, 5); // Recarga los comentarios de la visión general
            loadProfileStats(); // <--- ¡NUEVA LLAMADA PARA RECARGAR ESTADÍSTICAS AL HACER CLIC!
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
            loadAllUserComments(); // Llama a la nueva función que carga todos los comentarios
        });
    }

    // El botón de "Cargar mis datos (Protegido)" dentro de la sección de Datos Protegidos
    // Esto asegura que si el botón existe y se hace clic en él, también carga los datos protegidos
    if (fetchProtectedDataButton) {
        fetchProtectedDataButton.addEventListener('click', loadProtectedData);
    }
});