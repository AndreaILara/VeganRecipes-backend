const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const csv = require("csv-parser");
require("dotenv").config();
const Recipe = require("../api/models/Recipe");

// Conectar a MongoDB
mongoose
  .connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Conectado a la base de datos"))
  .catch((err) => console.error("❌ Error al conectar a MongoDB", err));

const recipes = [];

const validCategories = ["Desayuno", "Comida", "Merienda", "Cena"]; // Categorías válidas

fs.createReadStream(path.join(__dirname, "../data/recipes.csv"))
  .pipe(csv())
  .on("data", (row) => {
    recipes.push({
      title: row.title,
      ingredients: row.ingredients ? row.ingredients.split(",") : [],
      steps: row.steps ? row.steps.split(",") : [],
      category: validCategories.includes(row.category) ? row.category : "Comida", // Asignar categoría válida por defecto
      image: row.image || "https://example.com/default-image.jpg", // Imagen por defecto si falta
      createdBy: new mongoose.Types.ObjectId(), // Crear un ID de usuario temporal
    });
  })
  .on("end", async () => {
    try {
      await Recipe.insertMany(recipes);
      console.log("✅ Datos insertados correctamente en MongoDB");
      mongoose.connection.close();
    } catch (error) {
      console.error("❌ Error insertando datos:", error);
    }
  });
