// frontend/projects/vlog/js/register.js

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const messageDisplay = document.getElementById('messageDisplayRegister'); // Asegúrate de tener este ID en tu HTML de registro
    
    // Define la URL base del backend para desarrollo local
    const BASE_URL_BACKEND = 'https://tutorial-views-api.onrender.com'; 
    console.log(`register.js: Conectando al backend en: ${BASE_URL_BACKEND}`);

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => { // Añadir 'async' aquí
            event.preventDefault(); // Evita que el formulario se envíe de la manera tradicional

            const username = usernameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();

            // Validación básica (puedes añadir más validaciones de complejidad de contraseña)
            if (!username || !email || !password || !confirmPassword) {
                if (messageDisplay) {
                    messageDisplay.textContent = 'Por favor, rellena todos los campos.';
                    messageDisplay.style.color = 'red';
                    messageDisplay.style.display = 'block';
                } else {
                    alert('Por favor, rellena todos los campos.');
                }
                return;
            }

            if (password !== confirmPassword) {
                if (messageDisplay) {
                    messageDisplay.textContent = 'Las contraseñas no coinciden.';
                    messageDisplay.style.color = 'red';
                    messageDisplay.style.display = 'block';
                } else {
                    alert('Las contraseñas no coinciden.');
                }
                return;
            }

            // Opcional: Validaciones de contraseña más robustas (reutiliza las de tu auth.js)
            if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
                if (messageDisplay) {
                    messageDisplay.textContent = 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.';
                    messageDisplay.style.color = 'red';
                    messageDisplay.style.display = 'block';
                } else {
                    alert('La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.');
                }
                return;
            }

            if (messageDisplay) {
                messageDisplay.textContent = 'Registrando usuario...';
                messageDisplay.style.color = 'blue';
                messageDisplay.style.display = 'block';
            }

            try {
                // *** ¡AQUÍ VA LA LLAMADA REAL A LA API DE REGISTRO! ***
                const response = await fetch(`${BASE_URL_BACKEND}/api/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json(); // Parsear la respuesta JSON

                if (response.ok) { // Si la respuesta es 2xx (ej. 201 Created)
                    if (messageDisplay) {
                        messageDisplay.textContent = data.message || 'Registro exitoso. Redirigiendo...';
                        messageDisplay.style.color = 'green';
                        messageDisplay.style.display = 'block';
                    } else {
                        alert(data.message || 'Registro exitoso. Redirigiendo...');
                    }

                    // Después de un registro exitoso, puedes redirigir al login
                    // O, si tu backend en el registro también devuelve un token,
                    // podrías iniciar sesión automáticamente aquí como en login.js
                    setTimeout(() => {
                        window.location.href = `${BASE_URL_BACKEND}/projects/forms/login.html`; // Redirige al login para iniciar sesión
                    }, 1500);

                } else { // Si la respuesta es un error (4xx o 5xx)
                    if (messageDisplay) {
                        messageDisplay.textContent = data.message || 'Error en el registro.';
                        messageDisplay.style.color = 'red';
                        messageDisplay.style.display = 'block';
                    } else {
                        alert(data.message || 'Error en el registro.');
                    }
                }
            } catch (error) {
                console.error('Error de red o del servidor durante el registro:', error);
                if (messageDisplay) {
                    messageDisplay.textContent = 'Error de conexión con el servidor. Inténtalo de nuevo más tarde.';
                    messageDisplay.style.color = 'red';
                    messageDisplay.style.display = 'block';
                } else {
                    alert('Error de conexión con el servidor. Inténtalo de nuevo más tarde.');
                }
            }
        });
    }
});
