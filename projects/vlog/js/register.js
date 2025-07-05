// frontend/projects/vlog/js/register.js

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    // const messageDisplay = document.getElementById('message'); // Asume que tienes un párrafo para mensajes

    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Evita que el formulario se envíe de la manera tradicional

            const username = usernameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();

            // Validación básica (puedes añadir más validaciones de complejidad de contraseña)
            if (!username || !email || !password || !confirmPassword) {
                alert('Por favor, rellena todos los campos.');
                return;
            }

            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden.');
                return;
            }

            // Simulación de un registro exitoso
            // En un caso real, aquí iría tu fetch/axios a la API de registro.
            // Si la respuesta es exitosa, llamarías a window.login() para iniciar sesión automáticamente.

            // LLAMADA A LA FUNCIÓN GLOBAL DE LOGIN (del auth.js)
            if (typeof window.login === 'function') { // Asegurarse de que la función login está cargada
                window.login(username); // Usamos el nombre de usuario para el perfil
                alert(`¡Cuenta creada y sesión iniciada para ${username}!`);
                
                // Redirige al usuario después del registro y login automático
                //window.location.href = '/projects/vlog/html/tutoriales.html'; // Redirige a tu página principal
                window.location.href = 'https://tutorial-views-api.onrender.com/tutoriales';
            } else {
                console.error("Error: window.login no está definida. Asegúrate de que auth.js se carga correctamente.");
                alert('Error interno al procesar el registro.');
            }
        });
    }
});