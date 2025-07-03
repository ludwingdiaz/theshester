// backend/js/register.js  (Este comentario indica que está en el backend, pero en realidad es un archivo JS del frontend)
// Debería ser: frontend/js/register.js o public/js/register.js

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Evita el envío del formulario por defecto

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Validaciones básicas en el cliente
            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden.');
                return;
            }

            // Validar complejidad de contraseña (ejemplo simple)
            if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
                alert('La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.');
                return;
            }

            try {
                // *** ESTA ES LA LÍNEA QUE DEBES CAMBIAR ***
                // ANTES: 'http://localhost:3000/api/register'
                // AHORA: 'http://localhost:3000/api/auth/register'
                const response = await fetch('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message); // Por ejemplo: "Usuario registrado exitosamente"
                    // Opcional: Redirigir al usuario a la página de login o a otra página
                    window.location.href = 'login.html'; // Necesitarás crear login.html
                } else {
                    alert(data.message || 'Error al registrar el usuario.');
                }
            } catch (error) {
                console.error('Error de red o del servidor:', error);
                alert('Hubo un problema de conexión al intentar registrarte. Inténtalo de nuevo.');
            }
        });
    }
});