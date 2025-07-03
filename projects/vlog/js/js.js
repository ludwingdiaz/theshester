//Versiones Angular

document.querySelectorAll('.version-button').forEach(button => {
    button.addEventListener('click', function() {
        const version = this.dataset.version;
        document.getElementById('install-command').textContent = `npm install -g @angular/cli@${version}`;
        // Aquí puedes agregar lógica adicional, como ejecutar el comando en la terminal (solo si estás en un entorno Node.js)
    });
});


/////////////////