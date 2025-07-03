// js/theme-switcher.js

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Obtener los contenedores de los iconos
    const iconLightMode = document.querySelector('#theme-toggle .icon-light-mode');
    const iconDarkMode = document.querySelector('#theme-toggle .icon-dark-mode');

    // Función para aplicar el tema y manejar la visibilidad de los iconos
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            // Oculta el icono de sol, muestra el de luna
            if (iconLightMode) iconLightMode.style.display = 'none';
            if (iconDarkMode) iconDarkMode.style.display = 'flex'; // Usar 'flex' si tu CSS lo usa
        } else {
            body.classList.remove('dark-mode');
            // Oculta el icono de luna, muestra el de sol
            if (iconDarkMode) iconDarkMode.style.display = 'none';
            if (iconLightMode) iconLightMode.style.display = 'flex'; // Usar 'flex' si tu CSS lo usa
        }
    }

    // 1. Cargar el tema guardado o el preferido por el sistema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }

    // 2. Escuchar el clic del botón de toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (body.classList.contains('dark-mode')) {
                applyTheme('light');
                localStorage.setItem('theme', 'light');
            } else {
                applyTheme('dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }
});