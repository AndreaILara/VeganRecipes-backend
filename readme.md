# VeganRecipes-backend

[![Estado del proyecto](https://img.shields.io/badge/estado-completado-green.svg)](https://github.com/AndreaILara/VeganRecipes-backend)

## Descripción

**VeganRecipes-backend** es la parte del servidor de la aplicación **VeganRecipes**, diseñada para gestionar y proporcionar recetas veganas a los usuarios. Este backend maneja la lógica de negocio, la gestión de datos y las operaciones CRUD (Crear, Leer, Actualizar, Eliminar) relacionadas con las recetas. 

Cuenta con autenticación de usuarios, gestión de comentarios, un sistema de roles (usuario y administrador), integración con **Cloudinary** para la gestión de imágenes y la posibilidad de cargar recetas masivamente a través de un **CSV**.

## Tabla de Contenidos

- [Características](#características)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Instalación](#instalación)
- [Uso](#uso)
- [Rutas de la API](#rutas-de-la-api)
- [Contribuciones](#contribuciones)

## Características

- **Gestión completa de recetas**: Creación, lectura, actualización y eliminación.
- **Autenticación de usuarios**: Registro e inicio de sesión mediante JWT.
- **Roles de usuario**: 
  - **Usuario estándar**: Puede ver recetas, añadirlas a favoritos y comentar.
  - **Administrador**: Puede añadir recetas, eliminar comentarios de cualquier usuario, eliminar recetas y gestionar cuentas de usuario.
- **Gestión de comentarios**: Los usuarios pueden comentar recetas, y los administradores pueden eliminar comentarios si es necesario.
- **Carga masiva de datos**: Integración con **CSV** para subir recetas a la base de datos en lote.
- **Envío de correos de prueba**: Sistema de prueba para verificar que los correos electrónicos se envían correctamente a los usuarios.
- **Gestión de imágenes con Cloudinary**: Las imágenes de recetas se almacenan en la nube.

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución para JavaScript en el servidor.
- **Express.js**: Framework para la construcción de aplicaciones web y APIs.
- **MongoDB + Mongoose**: Base de datos NoSQL con modelado de datos en Node.js.
- **JSON Web Tokens (JWT)**: Para la autenticación y autorización de usuarios.
- **Cloudinary**: Para la gestión de imágenes.
- **CSV-parser**: Para importar recetas en formato CSV.

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

   # Configuración de Cloudinary
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret

   # Correo de prueba para verificación
   EMAIL_TEST=correo_de_prueba@example.com
   ```

5. **Inicia el servidor**:

   ```bash
   npm start
   ```

   El servidor estará disponible en `http://localhost:3000`.

## Uso

Una vez que el servidor esté en funcionamiento, puedes interactuar con la API utilizando herramientas como [Postman](https://www.postman.com/) o [Insomnia](https://insomnia.rest/). Asegúrate de configurar correctamente las cabeceras y los cuerpos de las solicitudes según sea necesario.

## Rutas de la API

A continuación, se detallan algunas de las rutas principales disponibles en la API:

### **Recetas**
- `GET /recipes` → Obtiene una lista de todas las recetas.
- `GET /recipes/:id` → Obtiene una receta por su ID.
- `POST /recipes` → **[Solo Admin]** Crea una nueva receta.
- `PUT /recipes/:id` → **[Solo Admin]** Actualiza una receta.
- `DELETE /recipes/:id` → **[Solo Admin]** Elimina una receta.

### **Usuarios**
- `POST /auth/register` → Registra un nuevo usuario.
- `POST /auth/login` → Inicia sesión y obtiene un token JWT.
- `DELETE /users/:username` → **[Solo Admin]** Elimina un usuario por su nombre.

### **Favoritos**
- `POST /favorites/:recipeId` → Agrega una receta a favoritos.
- `DELETE /favorites/:recipeId` → Elimina una receta de favoritos.

### **Comentarios**
- `POST /comments/:recipeId` → Agrega un comentario a una receta.
- `DELETE /comments/:commentId` → **[Solo Admin]** Elimina un comentario.

### **Carga de datos**
- `POST /upload-csv` → **[Solo Admin]** Permite subir recetas en formato CSV.

### **Cloudinary**
- `POST /upload-image` → **[Solo Admin]** Sube una imagen de receta a Cloudinary.

### **Correos de prueba**
- `POST /send-test-email` → Envía un correo de prueba a un usuario.

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

---
Este proyecto no tiene licencia, pero puedes usarlo y modificarlo según tus necesidades.







