const Favorite = require("../models/Favorite");
const Recipe = require("../models/Recipe");

// Agregar una receta a favoritos
const addRecipeToFavorites = async (req, res) => {
  try {
    const { recipeId } = req.body;

    // Verificar si la receta existe
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: "Receta no encontrada" });

    // Verificar si ya está en favoritos
    const existingFavorite = await Favorite.findOne({ user: req.user._id, recipe: recipeId });
    if (existingFavorite) return res.status(400).json({ message: "Esta receta ya está en favoritos" });

    const newFavorite = new Favorite({ user: req.user._id, recipe: recipeId });
    await newFavorite.save();

    res.json({ message: "Receta añadida a favoritos", newFavorite });
  } catch (error) {
    res.status(500).json({ message: "Error al añadir a favoritos", error });
  }
};

// Eliminar una receta de favoritos
const removeRecipeFromFavorites = async (req, res) => {
  try {
    const { recipeId } = req.body;

    const favorite = await Favorite.findOneAndDelete({ user: req.user._id, recipe: recipeId });
    if (!favorite) return res.status(400).json({ message: "Esta receta no está en favoritos" });

    res.json({ message: "Receta eliminada de favoritos" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar de favoritos", error });
  }
};

// Obtener recetas favoritas de un usuario
const getUserFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).populate("recipe");
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener recetas favoritas", error });
  }
};

module.exports = { addRecipeToFavorites, removeRecipeFromFavorites, getUserFavorites };
