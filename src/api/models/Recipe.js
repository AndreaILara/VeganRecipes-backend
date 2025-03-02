const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  ingredients: { type: [String], required: true },
  steps: { type: [String], required: true },
  category: { type: String, enum: ["Desayuno", "Comida", "Merienda", "Cena"], required: true },
  image: { type: String, required: true }, // URL de la imagen en Cloudinary
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Recipe", RecipeSchema);
