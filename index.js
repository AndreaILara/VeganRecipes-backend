require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const userRoutes = require("./src/api/routes/user.js");
const recipeRoutes = require("./src/api/routes/recipe.js");
const commentRoutes = require("./src/api/routes/comment.js");
const favoriteRoutes = require("./src/api/routes/favorite.js");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a la base de datos
connectDB();

// Rutas principales
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/recipes", recipeRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/favorites", favoriteRoutes);


//Ruta universal para que el servidor nos responda
app.use('*', (req, res, next) => {
  return res.status(404).json('Route Not Found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`The server is running at port ${PORT}`);
});
