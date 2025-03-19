# VeganRecipes-backend

[![Estado del proyecto](https://img.shields.io/badge/estado-en%20desarrollo-yellow.svg)](https://github.com/AndreaILara/VeganRecipes-backend)
[![Licencia MIT](https://img.shields.io/badge/licencia-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Descripción

**VeganRecipes-backend** es la parte del servidor de la aplicación VeganRecipes, diseñada para gestionar y proporcionar recetas veganas a los usuarios. Este backend maneja la lógica de negocio, la gestión de datos y las operaciones CRUD (Crear, Leer, Actualizar, Eliminar) relacionadas con las recetas.

## Tabla de Contenidos

- [Características](#características)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Instalación](#instalación)
- [Uso](#uso)
- [Rutas de la API](#rutas-de-la-api)
- [Contribuciones](#contribuciones)
- [Licencia](#licencia)

## Características

- Gestión de recetas veganas: creación, lectura, actualización y eliminación.
- Búsqueda y filtrado de recetas por ingredientes, categorías y más.
- Autenticación y autorización de usuarios para operaciones protegidas.

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución para JavaScript en el servidor.
- **Express.js**: Framework para la construcción de aplicaciones web y APIs.
- **MongoDB**: Base de datos NoSQL para el almacenamiento de recetas y usuarios.
- **Mongoose**: ODM (Object Data Modeling) para MongoDB y Node.js.
- **JSON Web Tokens (JWT)**: Para la autenticación y autorización de usuarios.

## Instalación

Sigue estos pasos para configurar el proyecto en tu entorno local:

1. **Clona este repositorio**:

   ```bash
   git clone https://github.com/AndreaILara/VeganRecipes-backend.git
   ```

2. **Navega al directorio del proyecto**:

   ```bash
   cd VeganRecipes-backend
   ```

3. **Instala las dependencias**:

   ```bash
   npm install
   ```

4. **Configura las variables de entorno**:

   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/veganrecipes
   JWT_SECRET=tu_secreto_jwt
   ```

5. **Inicia el servidor**:

   ```bash
   npm start
   ```

   El servidor estará disponible en `http://localhost:3000`.

## Uso

Una vez que el servidor esté en funcionamiento, puedes interactuar con las diferentes rutas de la API utilizando herramientas como [Postman](https://www.postman.com/) o [Insomnia](https://insomnia.rest/). Asegúrate de configurar correctamente las cabeceras y los cuerpos de las solicitudes según sea necesario.

## Rutas de la API

A continuación, se detallan algunas de las rutas principales disponibles en la API:

- **Recetas**:
  - `GET /recipes`: Obtiene una lista de todas las recetas.
  - `POST /recipes`: Crea una nueva receta (requiere autenticación).
  - `GET /recipes/:id`: Obtiene una receta por su ID.
  - `PUT /recipes/:id`: Actualiza una receta por su ID (requiere autenticación).
  - `DELETE /recipes/:id`: Elimina una receta por su ID (requiere autenticación).

- **Usuarios**:
  - `POST /auth/register`: Registra un nuevo usuario.
  - `POST /auth/login`: Inicia sesión y obtiene un token JWT.

Para más detalles sobre las rutas y su uso, consulta la [documentación de la API](https://github.com/AndreaILara/VeganRecipes-backend/wiki/API-Documentation).

## Contribuciones

Las contribuciones son bienvenidas. Si deseas colaborar, por favor sigue estos pasos:

1. **Fork** este repositorio.
2. Crea una nueva rama con tu característica o corrección de errores:

   ```bash
   git checkout -b nombre-de-tu-rama
   ```

3. Realiza tus cambios y haz commits descriptivos.
4. Envía tus cambios al repositorio remoto:

   ```bash
   git push origin nombre-de-tu-rama
   ```

5. Abre una **Pull Request** en este repositorio.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo [LICENSE](https://github.com/AndreaILara/VeganRecipes-backend/blob/main/LICENSE) para más detalles.
