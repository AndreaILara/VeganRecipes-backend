const Recipe = require("../models/Recipe");
const Favorite = require("../models/Favorite");
const { uploadImage, deleteImage } = require("../../utils/cloudinary");
const fs = require("fs");
const nodemailer = require("nodemailer");

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Obtener todas las recetas (con filtro opcional por categoría)
const getAllRecipes = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {}; // Filtra por categoría si se proporciona
    const recipes = await Recipe.find(filter).populate("createdBy", "username");
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener recetas", error });
  }
};

// Obtener una receta por ID
const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findById(id).populate("createdBy", "username");
    if (!recipe) return res.status(404).json({ message: "Receta no encontrada" });

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la receta", error });
  }
};

// Añadir receta a favoritos (usuario autenticado)
const addRecipeToFavorites = async (req, res) => {
  try {
    const { recipeId } = req.body;

    // Verificar si ya está en favoritos
    const existingFavorite = await Favorite.findOne({ user: req.user._id, recipe: recipeId });
    if (existingFavorite) return res.status(400).json({ message: "Esta receta ya está en favoritos" });

    const newFavorite = new Favorite({ user: req.user._id, recipe: recipeId });
    await newFavorite.save();

    res.json({ message: "Receta añadida a favoritos" });
  } catch (error) {
    res.status(500).json({ message: "Error al añadir a favoritos", error });
  }
};

// Eliminar receta de favoritos (usuario autenticado)
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

// Enviar sugerencias al administrador
const sendSuggestionToAdmin = async (req, res) => {
  try {
    const { subject, message } = req.body;

    await transporter.sendMail({
      from: req.user.email,
      to: process.env.EMAIL_USER,
      subject: `Sugerencia de ${req.user.username}: ${subject}`,
      text: message,
    });

    res.json({ message: "Sugerencia enviada al administrador" });
  } catch (error) {
    res.status(500).json({ message: "Error al enviar la sugerencia", error });
  }
};

// ADMIN: Crear una nueva receta
const createRecipe = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "No tienes permiso para agregar recetas" });
    }

    const { title, ingredients, steps, category } = req.body;
    if (!req.file) return res.status(400).json({ message: "Debe subir una imagen" });

    const result = await uploadImage(req.file.path); // Sube imagen a Cloudinary
    fs.unlinkSync(req.file.path); // Borra el archivo temporal

    const newRecipe = new Recipe({
      title,
      ingredients: ingredients.split(","),
      steps: steps.split(","),
      category,
      image: result.secure_url,
      createdBy: req.user._id,
    });

    await newRecipe.save();
    res.status(201).json({ message: "Receta creada con éxito", newRecipe });
  } catch (error) {
    res.status(500).json({ message: "Error al crear receta", error });
  }
};

// ADMIN: Editar una receta
const updateRecipe = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "No tienes permiso para editar recetas" });
    }

    const { id } = req.params;
    const { title, ingredients, steps, category } = req.body;
    const recipe = await Recipe.findById(id);
    if (!recipe) return res.status(404).json({ message: "Receta no encontrada" });

    if (title) recipe.title = title;
    if (ingredients) recipe.ingredients = ingredients.split(",");
    if (steps) recipe.steps = steps.split(",");
    if (category) recipe.category = category;

    if (req.file) {
      await deleteImage(recipe.image);
      const result = await uploadImage(req.file.path);
      fs.unlinkSync(req.file.path);
      recipe.image = result.secure_url;
    }

    await recipe.save();
    res.json({ message: "Receta actualizada", recipe });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar receta", error });
  }
};

// ADMIN: Eliminar una receta
const deleteRecipe = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "No tienes permiso para eliminar recetas" });
    }

    const { id } = req.params;
    const recipe = await Recipe.findById(id);
    if (!recipe) return res.status(404).json({ message: "Receta no encontrada" });

    await deleteImage(recipe.image);
    await recipe.deleteOne();

    res.json({ message: "Receta eliminada" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar receta", error });
  }
};

module.exports = {
  getAllRecipes,
  getRecipeById,
  addRecipeToFavorites,
  removeRecipeFromFavorites,
  sendSuggestionToAdmin,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};
