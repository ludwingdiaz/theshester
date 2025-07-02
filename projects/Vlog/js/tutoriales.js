const tutoriales = [
    {
        titulo: 'Introducción a HTML5',
        fecha: '2024-10-26',
        contenido: 'Una guía completa sobre HTML5...'
    },
    {
        titulo: 'Formularios en HTML',
        fecha: '2024-10-20',
        contenido: 'Aprende a crear formularios interactivos...'
    },
    {
        titulo: 'Estructura básica de HTML',
        fecha: '2024-10-28',
        contenido: 'Comprende la estructura fundamental de HTML...'
    },
    // Agrega aquí tus tutoriales locales
];

const mainTutoriales = document.getElementById('tutoriales');

// Función para ordenar tutoriales por fecha (de más reciente a más antiguo)
function ordenarTutoriales(a, b) {
    return new Date(b.fecha) - new Date(a.fecha);
}

// Función para mostrar tutoriales en la página
function mostrarTutoriales() {
    tutoriales.sort(ordenarTutoriales).forEach(tutorial => {
        const article = document.createElement('article');
        article.classList.add('article');
        article.innerHTML = `
        <h2>${tutorial.titulo}</h2>
        <p class="fecha">${tutorial.fecha}</p>
        <div class="contenido">${tutorial.contenido}</div>
      `;
        mainTutoriales.appendChild(article);
    });
}


function mostrarTutoriales() {
  tutoriales.sort(ordenarTutoriales).forEach((tutorial, index) => {
    const article = document.createElement('article');
    article.classList.add('article');
    article.innerHTML = `
      <h2>${tutorial.titulo}</h2>
      <p class="fecha">${tutorial.fecha}</p>
      <div class="contenido">${tutorial.contenido}</div>
    `;
    mainTutoriales.appendChild(article);

    // Añadimos un retraso para el efecto de aparición secuencial
    setTimeout(() => {
      article.classList.add('show');
    }, 100 * index);
  });
}

mostrarTutoriales();