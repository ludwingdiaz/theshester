document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageDisplay = document.getElementById('message');

    // Define la URL base del backend para desarrollo local
    const BASE_URL_BACKEND = 'https://tutorial-views-api.onrender.com';
    console.log(`login.js: Conectando al backend en: ${BASE_URL_BACKEND}`);


    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) {
                messageDisplay.textContent = 'Por favor, rellena todos los campos.';
                messageDisplay.style.color = 'red';
                return;
            }

            try {
                // Usa la URL base local para la petición de login
                const response = await fetch(`${BASE_URL_BACKEND}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('jwtToken', data.token);
                    localStorage.setItem('isLoggedIn', 'true');
                    
                    // --- ¡CORRECCIÓN CLAVE AQUÍ! Usar data.user.id en lugar de data.user._id ---
                    localStorage.setItem('userId', data.user.id); // El backend envía 'id', no '_id'
                    // ----------------------------------------------------------------------
                    localStorage.setItem('username', data.user.username); // Para el nombre de usuario
                    localStorage.setItem('userEmail', data.user.email);   // Para el correo electrónico

                    messageDisplay.textContent = data.message || 'Inicio de sesión exitoso.';
                    messageDisplay.style.color = 'green';

                    // --- CONSOLE.LOGS DE DEPURACIÓN AÑADIDOS ---
                    console.log('login.js: Token guardado:', localStorage.getItem('jwtToken'));
                    console.log('login.js: Username guardado:', localStorage.getItem('username'));
                    console.log('login.js: userId guardado:', localStorage.getItem('userId')); // ¡VERIFICACIÓN CRÍTICA!
                    // ------------------------------------------

                    setTimeout(() => {
                        // Usa la URL base local para la redirección al diario
                        const redirectToUrl = `${BASE_URL_BACKEND}/diario`; // Redirige directamente al diario
                        console.log('login.js: Redirigiendo a:', redirectToUrl);
                        window.location.href = redirectToUrl;
                    }, 500);
                } else {
                    messageDisplay.textContent = data.message || 'Error al iniciar sesión. Credenciales inválidas.';
                    messageDisplay.style.color = 'red';
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('username');
                    localStorage.removeItem('userId');    // Limpia también userId en caso de error
                    localStorage.removeItem('userEmail'); // Limpia también userEmail en caso de error
                }
            } catch (error) {
                console.error('Error de red o del servidor:', error);
                messageDisplay.textContent = 'Error de conexión con el servidor. Inténtalo de nuevo más tarde.';
                messageDisplay.style.color = 'red';
            }
        });
    }
});
