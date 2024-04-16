fetch('../header/header.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('contenedor').innerHTML = html;
    });

    fetch('../footer/footer.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('contenedor02').innerHTML = html;
    }); 