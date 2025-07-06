// js/theme-switcher.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica del cambio de tema ---
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
            if (iconDarkMode) iconDarkMode.style.display = 'flex'; // Asegúrate de que usas 'flex' si tu CSS lo usa para el icono por defecto
        } else {
            body.classList.remove('dark-mode');
            // Oculta el icono de luna, muestra el de sol
            if (iconDarkMode) iconDarkMode.style.display = 'none';
            if (iconLightMode) iconLightMode.style.display = 'flex'; // Asegúrate de que usas 'flex' si tu CSS lo usa para el icono por defecto
        }
    }

    // 1. Cargar el tema guardado o el preferido por el sistema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Si el sistema prefiere el modo oscuro y no hay uno guardado, aplicarlo
        applyTheme('dark');
        localStorage.setItem('theme', 'dark'); // Guardar esta preferencia
    } else {
        // Por defecto o si el sistema prefiere claro, aplicar tema claro
        applyTheme('light');
        localStorage.setItem('theme', 'light'); // Guardar esta preferencia
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
    } else {
        console.warn("El botón con ID 'theme-toggle' no fue encontrado. El cambio de tema no funcionará.");
    }

    // --- Lógica para el menú de hamburguesa ---
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    // ¡CAMBIO CLAVE! Ahora el objetivo es el header-right-group
    const headerRightGroup = document.querySelector('.header-right-group'); 

    if (hamburgerMenu && headerRightGroup) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active'); // Para la animación de la hamburguesa a X
            headerRightGroup.classList.toggle('active'); // Para mostrar/ocultar el menú móvil
        });

        // Opcional: Cierra el menú si se hace clic fuera de él (solo si el menú está activo)
        document.addEventListener('click', (event) => {
            // Asegúrate de que el clic no fue dentro de la hamburguesa ni dentro del menú desplegado
            const isClickInsideHamburger = hamburgerMenu.contains(event.target);
            const isClickInsideMenu = headerRightGroup.contains(event.target); // Ahora el headerRightGroup es el contenedor del menú
            
            // Si el menú está activo y el clic fue fuera de la hamburguesa Y fuera del grupo derecho
            if (headerRightGroup.classList.contains('active') && !isClickInsideHamburger && !isClickInsideMenu) {
                hamburgerMenu.classList.remove('active');
                headerRightGroup.classList.remove('active');
            }
        });

        // Opcional: Cierra el menú si la ventana se redimensiona y está abierto
        window.addEventListener('resize', () => {
            if (headerRightGroup.classList.contains('active')) {
                hamburgerMenu.classList.remove('active');
                headerRightGroup.classList.remove('active');
            }
        });

    } else {
        console.warn("Elementos del menú de hamburguesa o header-right-group no encontrados. El menú no funcionará.");
    }

    // --- Lógica de visibilidad de enlaces de navegación (Login, Registro, Perfil, Logout) ---
    const navLogin = document.getElementById('nav-login');
    const navRegistro = document.getElementById('nav-registro');
    const navProfile = document.getElementById('nav-profile');
    const navLogout = document.getElementById('nav-logout');
    const profileLink = document.getElementById('profile-link');

    const updateNavVisibility = (isLoggedIn, username = 'Usuario') => {
        if (isLoggedIn) {
            if (navLogin) navLogin.style.display = 'none';
            if (navRegistro) navRegistro.style.display = 'none';
            if (navProfile) {
                navProfile.style.display = 'block';
                if (profileLink) profileLink.textContent = username;
            }
            if (navLogout) navLogout.style.display = 'block';
        } else {
            if (navLogin) navLogin.style.display = 'block';
            if (navRegistro) navRegistro.style.display = 'block';
            if (navProfile) navProfile.style.display = 'none';
            if (navLogout) navLogout.style.display = 'none';
        }
    };

    updateNavVisibility(false); // Por defecto, no logueado

    if (navLogout) {
        navLogout.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Cerrando sesión...');
            updateNavVisibility(false);
        });
    }

    // --- Lógica del buscador ---
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    if (searchInput && searchButton) {
        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
            } else {
                console.log('Por favor, introduce un término de búsqueda.');
            }
        });

        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                searchButton.click();
            }
        });
    } else {
        console.warn("Elementos del buscador no encontrados. La búsqueda no funcionará.");
    }
});
