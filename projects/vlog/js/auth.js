// frontend/projects/vlog/js/auth.js

// Definir la función global 'login'
window.login = function(username) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', username);
    console.log(`Usuario ${username} ha iniciado sesión. Estado guardado.`);
    updateHeaderNav(); // Actualizar el header inmediatamente después del login
};

// Definir la función global 'logout'
window.logout = function() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    console.log('Sesión cerrada. Estado eliminado.');
    updateHeaderNav(); // Actualizar el header inmediatamente después del logout
    alert('Sesión cerrada correctamente.'); // Mensaje de confirmación
};

// Llamar al cargar la página para establecer el estado inicial del header
document.addEventListener('DOMContentLoaded', updateHeaderNav);

function updateHeaderNav() {
    const navLogin = document.getElementById('nav-login');
    const navRegistro = document.getElementById('nav-registro');
    const navDiario = document.getElementById('nav-diario');
    const navAcerca = document.getElementById('nav-acerca');   // Nuevo elemento de tu HTML
    const navContacto = document.getElementById('nav-contacto'); // Nuevo elemento de tu HTML

    const navProfile = document.getElementById('nav-profile'); // Li que contiene el enlace al perfil
    const profileLink = document.getElementById('profile-link'); // El enlace <a> dentro de nav-profile

    const navLogout = document.getElementById('nav-logout'); // Li que contiene el enlace de logout
    const logoutLink = document.getElementById('logout-link'); // El enlace <a> dentro de nav-logout

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username');

    if (isLoggedIn) {
        // Ocultar elementos de no logueado
        if (navLogin) navLogin.style.display = 'none';
        if (navRegistro) navRegistro.style.display = 'none';

        // Mostrar elementos de logueado
        if (navProfile) {
            navProfile.style.display = 'list-item';
            if (profileLink) {
                // ¡CRÍTICO! Insertar el texto directamente en el <a>
                profileLink.textContent = `${username || 'Perfil'}!`;
                profileLink.href = '/diario';
            }
        }
        if (navDiario) navDiario.style.display = 'list-item';
        if (navLogout) {
            navLogout.style.display = 'list-item';
            if (logoutLink) {
                // Asignar la función global de logout al click del enlace de cerrar sesión
                logoutLink.onclick = window.logout;
            }
        }
        // Asegurarse de que estos estén visibles si son para logueados o siempre
        if (navAcerca) navAcerca.style.display = 'list-item'; // O 'block' si no es list-item
        if (navContacto) navContacto.style.display = 'list-item'; // O 'block'

    } else { // No logueado
        // Mostrar elementos de no logueado
        if (navLogin) navLogin.style.display = 'list-item';
        if (navRegistro) navRegistro.style.display = 'list-item';

        // Ocultar elementos de logueado
        if (navProfile) navProfile.style.display = 'none';
        if (navDiario) navDiario.style.display = 'none';
        if (navLogout) navLogout.style.display = 'none';
        // Asegurarse de que estos estén visibles si son para no logueados o siempre
        if (navAcerca) navAcerca.style.display = 'list-item';
        if (navContacto) navContacto.style.display = 'list-item';
    }
}