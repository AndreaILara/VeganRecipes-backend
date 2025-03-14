const Recipe = require("../models/Recipe");
const { uploadImage, deleteImage } = require("../../utils/cloudinary");
const fs = require("fs");
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const getAllRecipes = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category) {
      const validCategories = ["Desayuno", "Comida", "Merienda", "Cena"];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ message: "Categoría inválida" });
      }
      filter.category = category;
    }

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

const createRecipe = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "No tienes permiso para agregar recetas" });
    }

    const { title, ingredients, steps, category } = req.body;
    if (!req.file) return res.status(400).json({ message: "Debe subir una imagen" });

    const result = await uploadImage(req.file.path);
    fs.unlinkSync(req.file.path);

    const newRecipe = new Recipe({
      title,
      ingredients, // Ahora se guarda como un string completo
      steps, // Ahora se guarda como un string completo
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
    if (ingredients) recipe.ingredients = ingredients; // Ahora se guarda como texto completo
    if (steps) recipe.steps = steps; // Ahora los pasos se guardan como texto completo
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

const getRecipesByCategory = async (req, res) => {
  try {
    const { category } = req.params; // Obtiene la categoría desde los parámetros de la URL

    // Verificar que la categoría sea válida
    const validCategories = ["Desayuno", "Comida", "Merienda", "Cena"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Categoría inválida" });
    }

    // Filtrar recetas por la categoría proporcionada (sin espacios extra)
    const recipes = await Recipe.find({ category: category.trim() }).populate("createdBy", "username");

    if (recipes.length === 0) {
      return res.status(404).json({ message: "No se encontraron recetas en esta categoría" });
    }

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener recetas por categoría", error });
  }
};



module.exports = {
  getAllRecipes,
  getRecipeById,
  sendSuggestionToAdmin,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipesByCategory,
};
