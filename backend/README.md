# Sistema de Conteo de Vistas para Tutoriales

Este proyecto implementa un sistema para contar las vistas de diferentes tutoriales o artículos, mostrando los contadores en una página principal y actualizándolos en tiempo real. Los datos se persisten en una base de datos MongoDB Atlas.

🚀 Características
Conteo de Vistas: Registra el número de veces que un tutorial ha sido "visitado" (haciendo clic en su tarjeta desde la página principal).

Visualización en la Home: Muestra el número actual de vistas para cada tutorial directamente en las tarjetas de la página principal.

Persistencia de Datos: Las vistas se almacenan en una base de datos MongoDB Atlas, asegurando que los contadores no se pierdan al reiniciar el servidor.

Prevención de Doble Conteo: Diseñado para evitar que las vistas se incrementen más de una vez por visita al usar el botón de retroceso del navegador, contando solo el clic inicial desde la página principal.

🛠️ Tecnologías Utilizadas
Backend:

Node.js

Express.js: Framework web para el servidor.

Mongoose: ODM (Object Data Modeling) para interactuar con MongoDB.

CORS: Middleware para habilitar solicitudes de origen cruzado.

dotenv: Para cargar variables de entorno desde un archivo .env.

Base de Datos:

MongoDB Atlas (en la nube).

Frontend:

HTML

JavaScript (cliente)

CSS

⚙️ Configuración del Proyecto
Sigue estos pasos para poner en marcha el proyecto en tu entorno local.

Prerrequisitos
Asegúrate de tener instalado:

Node.js y npm (Node Package Manager)

Una cuenta y un clúster en MongoDB Atlas

1. Configuración del Backend (Server)
Tu servidor Node.js es el encargado de manejar las peticiones del frontend para actualizar y obtener las vistas.

a. Instalación de Dependencias
Navega a la carpeta raíz de tu proyecto (donde estará tu server.js) y ejecuta:
npm install express mongoose cors dotenv

b. Archivo .env
Crea un archivo llamado .env en la misma carpeta que tu server.js. Este archivo contendrá tus variables de entorno sensibles (como la URI de conexión a tu base de datos).
MONGO_URI=mongodb+srv://<TU_USUARIO_ATLAS>:<TU_CONTRASEÑA_ATLAS>@cluster0.rvdbz.mongodb.net/tutorialViewsDB
PORT=3000

Reemplaza <TU_USUARIO_ATLAS> con el nombre de usuario que creaste en MongoDB Atlas.

Reemplaza <TU_CONTRASEÑA_ATLAS> con la contraseña de ese usuario.

tutorialViewsDB será el nombre de tu base de datos en Atlas. Si prefieres otro nombre, cámbialo aquí.

PORT es el puerto donde se ejecutará tu servidor.
