

  fetch('./components/footer/footer.html')
  .then(response => response.text())
  .then(html => {
    document.getElementById('contenedor02').innerHTML = html;
  }); 