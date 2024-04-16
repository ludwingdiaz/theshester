let next = document.querySelector(".next")
let prev = document.querySelector(".prev")
next.addEventListener('click', function () {
    let items = document.querySelectorAll('.item')
    document.querySelector('.slide').appendChild(items[0])
    console.log(items);
})
prev.addEventListener('click', function () {
    let items = document.querySelectorAll('.item')
    document.querySelector('.slide').prepend(items[items.length - 1])
})

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