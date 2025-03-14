const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  ingredients: { type: String, required: true }, // Ahora es un string completo
  steps: { type: String, required: true }, // Ahora los pasos son texto completo
  category: { type: String, enum: ["Desayuno", "Comida", "Merienda", "Cena"], required: true },
  image: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Recipe", RecipeSchema);
