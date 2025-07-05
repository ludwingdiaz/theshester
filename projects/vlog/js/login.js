// frontend/projects/vlog/js/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageDisplay = document.getElementById('message');

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
                // --- ¡AHORA HACEMOS UNA PETICIÓN REAL A TU BACKEND! ---
                const response = await fetch('https://tutorial-views-api.onrender.com/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json(); 

                if (response.ok) { 
                    // ¡CRÍTICO! Guardar el token REAL y los datos del usuario recibidos del backend
                    localStorage.setItem('jwtToken', data.token);
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('username', data.user.email); // Usamos el email del objeto 'user'

                    messageDisplay.textContent = data.message || 'Inicio de sesión exitoso.';
                    messageDisplay.style.color = 'green';
                    
                    setTimeout(() => {
                        //window.location.href = '/projects/vlog/html/tutoriales.html';
                        window.location.href = '/';
                    }, 500);
                } else { 
                    messageDisplay.textContent = data.message || 'Error al iniciar sesión. Credenciales inválidas.';
                    messageDisplay.style.color = 'red';
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('username');
                }
            } catch (error) {
                console.error('Error de red o del servidor:', error);
                messageDisplay.textContent = 'Error de conexión con el servidor. Inténtalo de nuevo más tarde.';
                messageDisplay.style.color = 'red';
            }
        });
    }
});