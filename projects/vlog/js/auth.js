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
    const navAcerca = document.getElementById('nav-acerca');
    const navContacto = document.getElementById('nav-contacto');

    const navProfile = document.getElementById('nav-profile');
    const profileLink = document.getElementById('profile-link');

    const navLogout = document.getElementById('nav-logout');
    const logoutLink = document.getElementById('logout-link');

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username');

    if (isLoggedIn) {
        // Ocultar elementos de no logueado
        if (navLogin) navLogin.style.cssText = 'display: none !important;';
        if (navRegistro) navRegistro.style.cssText = 'display: none !important;';

        // Mostrar elementos de logueado
        if (navProfile) {
            navProfile.style.cssText = 'display: list-item !important;';
            if (profileLink) {
                profileLink.textContent = `${username || 'Perfil'}!`;
                profileLink.href = '/diario';
            }
        }
        if (navDiario) navDiario.style.cssText = 'display: list-item !important;';
        if (navLogout) {
            navLogout.style.cssText = 'display: list-item !important;';
            if (logoutLink) {
                logoutLink.onclick = window.logout;
            }
        }
        // Asegurarse de que estos estén visibles si son para logueados o siempre
        if (navAcerca) navAcerca.style.cssText = 'display: list-item !important;';
        if (navContacto) navContacto.style.cssText = 'display: list-item !important;';

    } else { // No logueado
        // Mostrar elementos de no logueado
        if (navLogin) navLogin.style.cssText = 'display: list-item !important;';
        if (navRegistro) navRegistro.style.cssText = 'display: list-item !important;';

        // Ocultar elementos de logueado
        if (navProfile) navProfile.style.cssText = 'display: none !important;';
        if (navDiario) navDiario.style.cssText = 'display: none !important;';
        if (navLogout) navLogout.style.cssText = 'display: none !important;';
        // Asegurarse de que estos estén visibles si son para no logueados o siempre
        if (navAcerca) navAcerca.style.cssText = 'display: list-item !important;';
        if (navContacto) navContacto.style.cssText = 'display: list-item !important;';
    }
}