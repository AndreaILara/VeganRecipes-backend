require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const userRoutes = require("./src/api/routes/user.js");
const recipeRoutes = require("./src/api/routes/recipe.js");
const commentRoutes = require("./src/api/routes/comment.js");

const app = express();


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5176"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Aplica CORS con las opciones
app.use(cors(corsOptions));


// Conectar a la base de datos
connectDB();
// Rutas principales
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/recipes", recipeRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/contact", require("./src/api/routes/contact"));

// Ruta universal para manejar rutas no existentes
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route Not Found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
