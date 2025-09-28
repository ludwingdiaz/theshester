document.addEventListener('DOMContentLoaded', async () => {
    // Referencias a los elementos del DOM (IDs de la dashboard)
    const usernameDisplaySidebar = document.getElementById('usernameDisplaySidebar');
    const userEmailDisplaySidebar = document.getElementById('userEmailDisplaySidebar');
    const usernameDisplayMain = document.getElementById('usernameDisplayMain');
    const messageBox = document.getElementById('messageBox');
    const usernameDisplayHeader = document.getElementById('usernameDisplayHeader'); // Para el nombre en el header

     // Referencia para la imagen del avatar
    const profileAvatarDisplay = document.getElementById('profileAvatarDisplay'); 

      // Elementos del formulario de edición de perfil (con la nueva referencia para la foto)
    const profilePictureInput = document.getElementById('profilePictureInput'); // Referencia al input de tipo file

    // Navegación de la sidebar
    const visionGeneralLink = document.getElementById('visionGeneralLink');
    const editProfileLink = document.getElementById('editProfileLink');
    const securityLink = document.getElementById('securityLink');
    const misComentariosLink = document.getElementById('misComentariosLink');

    // Secciones de contenido dinámico (ASEGÚRATE QUE ESTOS IDs EXISTEN EN TU HTML diario.ejs)
    const profileOverviewSection = document.getElementById('profile-overview-section');
    const commentsSection = document.getElementById('comments-section'); // Esta es la sección donde se muestran TODOS los comentarios
    const protectedDataSection = document.getElementById('protected-data-section');
    const editProfileSection = document.getElementById('edit-profile-section'); // Sección para editar perfil
    const securitySection = document.getElementById('security-section');

    // Elementos específicos de las secciones de comentarios
    const commentsListOverview = document.getElementById('commentsListOverview'); // Contenedor para la lista de comentarios en VISIÓN GENERAL (limitado a 10)
    const commentsListAll = document.getElementById('commentsListAll'); // Contenedor para la lista de TODOS los comentarios (en "Mis Comentarios")
    
    // Elementos para la sección de datos protegidos
    const fetchProtectedDataButton = document.getElementById('fetchProtectedData');
    const protectedMessage = document.getElementById('protectedMessage');

    // Elementos del formulario de edición de perfil (SOLO USUARIO, CONTRASEÑAS REMOVIDAS DE AQUÍ)
    const editProfileForm = document.getElementById('editProfileForm');
    const editUsernameInput = document.getElementById('editUsername');
    // const currentPasswordInput = document.getElementById('currentPassword'); // REMOVIDO
    // const newPasswordInput = document.getElementById('newPassword');         // REMOVIDO
    // const confirmNewPasswordInput = document.getElementById('confirmNewPassword'); // REMOVIDO
    const editProfileMessage = document.getElementById('editProfileMessage');

    // Elementos específicos de la sección de SEGURIDAD
    const changePasswordFormSecurity = document.getElementById('change-password-form');
    const currentPasswordInputSecurity = document.getElementById('current-password'); // AÑADIDO PARA LA SECCIÓN DE SEGURIDAD
    const newPasswordInputSecurity = document.getElementById('new-password');       // AÑADIDO PARA LA SECCIÓN DE SEGURIDAD
    const confirmNewPasswordInputSecurity = document.getElementById('confirm-new-password'); // AÑADIDO PARA LA SECCIÓN DE SEGURIDAD
    const passwordMessageBoxSecurity = document.getElementById('password-message');
    const toggle2faButton = document.getElementById('toggle-2fa-button');
    const twoFaStatus = document.getElementById('2fa-status');
    const twoFaMessageBox = document.getElementById('2fa-message');
    const activeSessionsList = document.getElementById('active-sessions-list');
    const logoutAllSessionsButton = document.getElementById('logout-all-sessions-button');
    const sessionsMessageBox = document.getElementById('sessions-message');

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

      // Actualiza la imagen del avatar
    function updateProfileAvatar(url) {
        if (profileAvatarDisplay) {
            profileAvatarDisplay.src = url;
        }
    }

    // Función para cargar los datos del perfil (al cargar la página y verificar autenticación)
   async function loadUserProfile() {
        let token = localStorage.getItem('jwtToken');
        let usernameFromLocalStorage = localStorage.getItem('username');
        let userIdFromLocalStorage = localStorage.getItem('userId');
        let userEmailFromLocalStorage = localStorage.getItem('userEmail');
        let profilePictureFromLocalStorage = localStorage.getItem('profilePicture'); 

        console.log('diario.js: Valor de userId en localStorage al inicio:', userIdFromLocalStorage);

        if (!token || !usernameFromLocalStorage || !userIdFromLocalStorage) {
            showMessage('Necesitas iniciar sesión para acceder a tu perfil.', 'error');
            localStorage.clear();
            window.location.href = `${BASE_URL_BACKEND}/projects/forms/login.html`;
            return;
        }

        updateUsernameDisplays(usernameFromLocalStorage);
        updateEmailDisplay(userEmailFromLocalStorage);
        // Usa la URL de Cloudinary por defecto si no hay profilePictureFromLocalStorage
        updateProfileAvatar(profilePictureFromLocalStorage || 'https://asset.cloudinary.com/dvulqsi0o/70bba0a0431785d3f86227e24e48e023'); 

        try {
            const response = await fetch(`${BASE_URL_BACKEND}/api/auth/profile`, { 
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const user = await response.json();
                localStorage.setItem('username', user.username);
                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('userId', user._id);
                // Asegura que siempre se guarde una URL válida (la de Cloudinary por defecto si no hay)
                localStorage.setItem('profilePicture', user.profilePicture || 'https://asset.cloudinary.com/dvulqsi0o/70bba0a0431785d3f86227e24e48e023'); 

                updateUsernameDisplays(user.username);
                updateEmailDisplay(user.email);
                // Asegura que siempre se muestre una URL válida
                updateProfileAvatar(user.profilePicture || 'https://asset.cloudinary.com/dvulqsi0o/70bba0a0431785d3f86227e24e48e023');
                
                loadComments(commentsListOverview, 5);
                loadProfileStats();
            } else if (response.status === 401 || response.status === 403) {
                showMessage('Sesión expirada o no autorizada. Por favor, inicie sesión de nuevo.', 'error');
                localStorage.clear();
                setTimeout(() => { window.location.href = `${BASE_URL_BACKEND}/projects/forms/login.html`; }, 1500);
            } else {
                showMessage('Error al cargar datos del perfil.', 'error');
                console.error('Error al cargar perfil:', await response.json());
            }
        } catch (error) {
            showMessage('Error de red al cargar el perfil.', 'error');
            console.error('Error de red:', error);
        }
    }

    // Lógica de protección de ruta y carga inicial (se ejecuta al cargar el script)
    await loadUserProfile(); // Asegura que el perfil del usuario se cargue y se verifique la autenticación

    // Lógica del botón de cerrar sesión (para el header)
    const logoutHeaderButton = document.getElementById('logout-link'); 
    console.log('logoutHeaderButton found:', logoutHeaderButton); // Debug 1

       if (logoutHeaderButton) {
        logoutHeaderButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Logout button clicked.'); // Debug 2
            
            localStorage.clear(); // Limpia todo el almacenamiento local (token, username, etc.)
            console.log('localStorage cleared.'); // Debug 3
            
            showMessage('Sesión cerrada correctamente.', 'success'); 
            console.log('showMessage called.'); // Debug 4
            
            // Un pequeño retraso para asegurar que el mensaje se muestre antes de la redirección
            setTimeout(() => {
                window.location.href = `${BASE_URL_BACKEND}/tutoriales`; // Redirige al home o a la página de inicio
                console.log('Redirecting to:', `${BASE_URL_BACKEND}/tutoriales`); // Debug 5
            }, 100); 
        });
    } else {
        console.warn('Logout button element (ID: logout-link) not found in the DOM.'); // Debug 6
    }

    // Función para mostrar solo una sección de contenido y ocultar las demás
    function showSection(sectionToShow) {
        // Oculta todas las secciones principales de contenido
        [profileOverviewSection, commentsSection, protectedDataSection, editProfileSection, securitySection].forEach(section => {
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
        } else if (sectionToShow === securitySection && securityLink) {
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
    async function loadAllUserComments() {
        showSection(commentsSection);
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
            if (commentsPublishedDisplay) commentsPublishedDisplay.textContent = 'Error';
            if (lastActivityDisplay) lastActivityDisplay.textContent = 'Error';
            if (articlesViewedDisplay) articlesViewedDisplay.textContent = 'Error';
        }
    }

    // Lógica para la sección de datos protegidos
    async function loadProtectedData() {
        if (!protectedMessage) {
            console.warn("Elemento protectedMessage no encontrado.");
            return;
        }
        protectedMessage.textContent = 'Cargando...';

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

    // Función para cargar y mostrar el formulario de edición de perfil (SOLO USUARIO)
    async function loadEditProfileForm() {
        showSection(editProfileSection); // Muestra la sección de edición de perfil
        const username = localStorage.getItem('username');
        if (editUsernameInput && username) {
            editUsernameInput.value = username; // Pre-rellena el campo de nombre de usuario
        }
        // Limpia los campos de contraseña y mensajes anteriores (AHORA ESTÁN EN SECURITY)
        // if (currentPasswordInput) currentPasswordInput.value = ''; // REMOVIDO
        // if (newPasswordInput) newPasswordInput.value = '';         // REMOVIDO
        // if (confirmNewPasswordInput) confirmNewPasswordInput.value = ''; // REMOVIDO
        if (editProfileMessage) {
            editProfileMessage.textContent = '';
            editProfileMessage.style.display = 'none';
        }
    }

    // Manejar el envío del formulario de edición de perfil (SOLO USUARIO)
  if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const newUsername = editUsernameInput.value.trim();
            const profilePictureFile = profilePictureInput.files[0]; // <--- OBTENER EL ARCHIVO

            if (!newUsername && !profilePictureFile) { // Validar si al menos un campo tiene un valor
                editProfileMessage.textContent = 'Debes proporcionar un nuevo nombre de usuario o seleccionar una nueva foto.';
                editProfileMessage.className = 'message-box error';
                editProfileMessage.style.display = 'block';
                return;
            }
            
            editProfileMessage.textContent = 'Guardando cambios...';
            editProfileMessage.className = 'message-box info';
            editProfileMessage.style.display = 'block';

            const token = localStorage.getItem('jwtToken');
            const userId = localStorage.getItem('userId');

            if (!userId) {
    console.error('User ID not found. Cannot change password.');
    // Muestra un mensaje al usuario o redirige a login
    return;
}

            // === CAMBIOS CLAVE AQUÍ: USAR FormData ===
            const formData = new FormData();
            formData.append('username', newUsername); // Añadir el nombre de usuario
            
            if (profilePictureFile) {
                formData.append('profilePicture', profilePictureFile); // Añadir el archivo si existe
            }
            // =======================================

            try {
                const response = await fetch(`${BASE_URL_BACKEND}/api/auth/profile/${userId}`, {
                    method: 'PUT',
                    headers: {
                        // NO ESTABLECER 'Content-Type' CUANDO SE USA FormData con archivos.
                        // El navegador lo establecerá automáticamente con el límite correcto.
                        'Authorization': `Bearer ${token}` 
                    },
                    body: formData // <--- ENVIAR EL OBJETO FormData
                });

                const data = await response.json();

                if (response.ok) {
                    editProfileMessage.textContent = data.message || 'Perfil actualizado exitosamente.';
                    editProfileMessage.className = 'message-box success';
                    editProfileMessage.style.display = 'block';
                    
                    localStorage.setItem('username', data.user.username);
                    // Asegúrate de actualizar la foto de perfil en localStorage y en la UI
                    localStorage.setItem('profilePicture', data.user.profilePicture || 'https://asset.cloudinary.com/dvulqsi0o/70bba0a0431785d3f86227e24e48e023'); 
                    updateUsernameDisplays(data.user.username);
                    updateProfileAvatar(data.user.profilePicture || 'https://asset.cloudinary.com/dvulqsi0o/70bba0a0431785d3f86227e24e48e023');

                    profilePictureInput.value = ''; // Limpiar el input de archivo después de subir

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
    // Lógica para la sección de SEGURIDAD (TODO EL CAMBIO DE CONTRASEÑA AQUÍ)
   if (changePasswordFormSecurity) {
        changePasswordFormSecurity.addEventListener('submit', async (e) => {
            e.preventDefault();

            const currentPassword = currentPasswordInputSecurity.value;
            const newPassword = newPasswordInputSecurity.value;
            const confirmNewPassword = confirmNewPasswordInputSecurity.value;

            if (!currentPassword || !newPassword || !confirmNewPassword) {
                passwordMessageBoxSecurity.textContent = 'Todos los campos de contraseña son requeridos.';
                passwordMessageBoxSecurity.className = 'message-box error';
                passwordMessageBoxSecurity.style.display = 'block';
                return;
            }

            if (newPassword !== confirmNewPassword) {
                passwordMessageBoxSecurity.textContent = 'La nueva contraseña y su confirmación no coinciden.';
                passwordMessageBoxSecurity.className = 'message-box error';
                passwordMessageBoxSecurity.style.display = 'block';
                return;
            }

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
            if (!passwordRegex.test(newPassword)) {
                passwordMessageBoxSecurity.textContent = 'La nueva contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y al menos un símbolo.';
                passwordMessageBoxSecurity.className = 'message-box error';
                passwordMessageBoxSecurity.style.display = 'block';
                return;
            }

            passwordMessageBoxSecurity.textContent = 'Cambiando contraseña...';
            passwordMessageBoxSecurity.className = 'message-box info';
            passwordMessageBoxSecurity.style.display = 'block';

            const token = localStorage.getItem('jwtToken');
            // --- ¡CORRECCIÓN CLAVE AQUÍ! Obtener userId del localStorage ---
            const userId = localStorage.getItem('userId'); 

            if (!userId) { // Validación adicional
                passwordMessageBoxSecurity.textContent = 'Error: ID de usuario no encontrado. Por favor, inicie sesión de nuevo.';
                passwordMessageBoxSecurity.className = 'message-box error';
                passwordMessageBoxSecurity.style.display = 'block';
                localStorage.clear();
                setTimeout(() => { window.location.href = `${BASE_URL_BACKEND}/projects/forms/login.html`; }, 1500);
                return;
            }

            try {
                const response = await fetch(`${BASE_URL_BACKEND}/api/auth/profile/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ currentPassword, newPassword })
                });

                const data = await response.json();

                if (response.ok) {
                    passwordMessageBoxSecurity.textContent = data.message;
                    passwordMessageBoxSecurity.className = 'message-box success';
                    changePasswordFormSecurity.reset(); // Limpiar campos de contraseña
                } else {
                    passwordMessageBoxSecurity.textContent = data.message || 'Error al cambiar la contraseña.';
                    passwordMessageBoxSecurity.className = 'message-box error';
                    if (response.status === 401 || response.status === 403) {
                        setTimeout(() => { window.location.href = `${BASE_URL_BACKEND}/projects/forms/login.html`; }, 1500);
                    }
                }
            } catch (error) {
                passwordMessageBoxSecurity.textContent = 'Error de red al cambiar la contraseña.';
                passwordMessageBoxSecurity.className = 'message-box error';
                console.error('Error de red:', error);
            } finally {
                setTimeout(() => { passwordMessageBoxSecurity.style.display = 'none'; }, 3000);
            }
        });
    }

    // --- Lógica para Autenticación de Dos Factores (2FA) ---
    async function update2faStatus() {
        if (!twoFaStatus) return;
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            twoFaStatus.textContent = 'Desconocido (no logueado)';
            return;
        }
        try {
            const response = await fetch(`${BASE_URL_BACKEND}/api/auth/2fa/status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                twoFaStatus.textContent = data.enabled ? 'Activado' : 'Desactivado';
                if (toggle2faButton) toggle2faButton.textContent = data.enabled ? 'Desactivar 2FA' : 'Activar 2FA';
            } else {
                twoFaStatus.textContent = 'Error al cargar estado';
                console.error('Error al cargar estado 2FA:', await response.json());
            }
        } catch (error) {
            twoFaStatus.textContent = 'Error de red';
            console.error('Error de red al cargar estado 2FA:', error);
        }
    }

    if (toggle2faButton) {
        toggle2faButton.addEventListener('click', async () => {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                if (twoFaMessageBox) {
                    twoFaMessageBox.textContent = 'Debes iniciar sesión para gestionar 2FA.';
                    twoFaMessageBox.className = 'message-box error';
                    twoFaMessageBox.style.display = 'block';
                }
                return;
            }

            if (twoFaMessageBox) {
                twoFaMessageBox.textContent = 'Actualizando 2FA...';
                twoFaMessageBox.className = 'message-box info';
                twoFaMessageBox.style.display = 'block';
            }

            try {
                const currentStatus = twoFaStatus.textContent === 'Activado';
                const endpoint = currentStatus ? 'disable' : 'enable';
                const response = await fetch(`${BASE_URL_BACKEND}/api/auth/2fa/${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    if (twoFaMessageBox) {
                        twoFaMessageBox.textContent = data.message;
                        twoFaMessageBox.className = 'message-box success';
                    }
                    update2faStatus(); // Actualiza el estado en la interfaz
                } else {
                    if (twoFaMessageBox) {
                        twoFaMessageBox.textContent = data.message || 'Error al gestionar 2FA.';
                        twoFaMessageBox.className = 'message-box error';
                    }
                }
            } catch (error) {
                if (twoFaMessageBox) {
                    twoFaMessageBox.textContent = 'Error de red al gestionar 2FA.';
                    twoFaMessageBox.className = 'message-box error';
                }
                console.error('Error de red 2FA:', error);
            } finally {
                if (twoFaMessageBox) {
                    setTimeout(() => { twoFaMessageBox.style.display = 'none'; }, 3000);
                }
            }
        });
    }

    // --- Lógica para Sesiones Activas ---
    async function loadActiveSessions() {
        if (!activeSessionsList) return;
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            activeSessionsList.innerHTML = '<p>Debes iniciar sesión para ver tus sesiones activas.</p>';
            return;
        }
        activeSessionsList.innerHTML = '<p>Cargando sesiones...</p>';
        try {
            const response = await fetch(`${BASE_URL_BACKEND}/api/auth/sessions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.sessions && data.sessions.length > 0) {
                    activeSessionsList.innerHTML = '';
                    data.sessions.forEach(session => {
                        const sessionDiv = document.createElement('div');
                        sessionDiv.className = 'session-item card'; 
                        sessionDiv.innerHTML = `
                            <p><strong>Dispositivo:</strong> ${session.device || 'Desconocido'}</p>
                            <p><strong>Ubicación:</strong> ${session.location || 'Desconocida'}</p>
                            <p><strong>Última actividad:</strong> ${new Date(session.lastActivity).toLocaleString()}</p>
                        </div>`;
                        activeSessionsList.appendChild(sessionDiv);
                    });
                } else {
                    activeSessionsList.innerHTML = '<p>No hay otras sesiones activas.</p>';
                }
            } else {
                activeSessionsList.innerHTML = '<p>Error al cargar sesiones.</p>';
                console.error('Error al cargar sesiones:', await response.json());
            }
        } catch (error) {
            activeSessionsList.innerHTML = '<p>Error de red al cargar sesiones.</p>';
            console.error('Error de red sesiones:', error);
        }
    }

    if (logoutAllSessionsButton) {
        logoutAllSessionsButton.addEventListener('click', async () => {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                if (sessionsMessageBox) {
                    sessionsMessageBox.textContent = 'Debes iniciar sesión para cerrar sesiones.';
                    sessionsMessageBox.className = 'message-box error';
                    sessionsMessageBox.style.display = 'block';
                }
                return;
            }

            if (sessionsMessageBox) {
                sessionsMessageBox.textContent = 'Cerrando todas las sesiones...';
                sessionsMessageBox.className = 'message-box info';
                sessionsMessageBox.style.display = 'block';
            }

            try {
                const response = await fetch(`${BASE_URL_BACKEND}/api/auth/sessions/logout-all-others`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const data = await response.json();

                if (response.ok) {
                    if (sessionsMessageBox) {
                        sessionsMessageBox.textContent = data.message;
                        sessionsMessageBox.className = 'message-box success';
                    }
                    loadActiveSessions(); // Recargar la lista de sesiones
                } else {
                    if (sessionsMessageBox) {
                        sessionsMessageBox.textContent = data.message || 'Error al cerrar sesiones.';
                        sessionsMessageBox.className = 'message-box error';
                    }
                }
            } catch (error) {
                if (sessionsMessageBox) {
                    sessionsMessageBox.textContent = 'Error de red al cerrar sesiones.';
                    sessionsMessageBox.className = 'message-box error';
                }
                console.error('Error de red al cerrar sesiones:', error);
            } finally {
                if (sessionsMessageBox) {
                    setTimeout(() => { sessionsMessageBox.style.display = 'none'; }, 3000);
                }
            }
        });
    }

    // --- Lógica de eventos para la navegación de la sidebar y botones principales ---

    // Inicialmente, cargar la visión general al cargar la página
    showSection(profileOverviewSection); // Muestra la sección de visión general al inicio
    loadComments(commentsListOverview, 5); // Carga los 10 últimos comentarios para la visión general
    loadProfileStats(); // Carga las estadísticas al inicio

    // Event listener para el enlace "Visión General"
    if (visionGeneralLink) {
        visionGeneralLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.profile-nav-item').forEach(link => link.classList.remove('active'));
            visionGeneralLink.classList.add('active');
            showSection(profileOverviewSection);
            loadComments(commentsListOverview, 5);
            loadProfileStats();
        });
    }

    // Para Editar Perfil (solo username)
    if (editProfileLink) {
        editProfileLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.profile-nav-item').forEach(link => link.classList.remove('active'));
            editProfileLink.classList.add('active');
            loadEditProfileForm();
            showMessage('Editando tu perfil (solo nombre de usuario)...', 'info');
        });
    }

    // Para Seguridad (incluye cambio de contraseña)
    if (securityLink) {
        securityLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.profile-nav-item').forEach(link => link.classList.remove('active'));
            securityLink.classList.add('active');
            showSection(securitySection);
            update2faStatus();
            loadActiveSessions();
            // Limpia los campos de contraseña en la sección de seguridad cada vez que se carga
            if (currentPasswordInputSecurity) currentPasswordInputSecurity.value = '';
            if (newPasswordInputSecurity) newPasswordInputSecurity.value = '';
            if (confirmNewPasswordInputSecurity) confirmNewPasswordInputSecurity.value = '';
            if (passwordMessageBoxSecurity) {
                passwordMessageBoxSecurity.textContent = '';
                passwordMessageBoxSecurity.style.display = 'none';
            }
            showMessage('Mostrando configuración de seguridad (incluye cambio de contraseña)...', 'info');
        });
    }

    if (misComentariosLink) {
        misComentariosLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.profile-nav-item').forEach(link => link.classList.remove('active'));
            misComentariosLink.classList.add('active');
            loadAllUserComments();
        });
    }

    // El botón de "Cargar mis datos (Protegido)" dentro de la sección de Datos Protegidos
    if (fetchProtectedDataButton) {
        fetchProtectedDataButton.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(protectedDataSection);
            loadProtectedData();
        });
    }
});
