require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const userRoutes = require("./src/api/routes/user.js");
const recipeRoutes = require("./src/api/routes/recipe.js");
const commentRoutes = require("./src/api/routes/comment.js");

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

// Ruta universal para manejar rutas no existentes
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route Not Found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
