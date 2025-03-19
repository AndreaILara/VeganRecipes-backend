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

    console.log("✅ Datos recibidos en req.body:", req.body);
    console.log("✅ Archivo recibido en req.file:", req.file);

    const { title, ingredients, steps, category, prepTime, cookTime, servings } = req.body;

    if (!req.file) {
      console.error("❌ No se recibió ninguna imagen.");
      return res.status(400).json({ message: "Debe subir una imagen" });
    }

    // 🔹 Subir imagen a Cloudinary
    const result = await uploadImage(req.file.buffer);
    console.log("✅ Imagen subida a Cloudinary:", result.secure_url);

    const newRecipe = new Recipe({
      title,
      ingredients,
      steps,
      category,
      prepTime,
      cookTime,
      servings,
      image: result.secure_url,
      createdBy: req.user._id,
    });

    await newRecipe.save();
    console.log("✅ Receta guardada en la base de datos.");
    res.status(201).json({ message: "Receta creada con éxito", newRecipe });
  } catch (error) {
    console.error("❌ Error al crear receta:", error);
    res.status(500).json({ message: "Error al crear receta", error });
  }
};


// ADMIN: Editar una receta
const updateRecipe = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "No tienes permiso para editar recetas" });

    const { id } = req.params;
    const { title, ingredients, steps, category, prepTime, cookTime, servings } = req.body;
    const recipe = await Recipe.findById(id);
    if (!recipe) return res.status(404).json({ message: "Receta no encontrada" });

    // 🔹 Actualizar campos de la receta
    if (title) recipe.title = title;
    if (ingredients) recipe.ingredients = ingredients;
    if (steps) recipe.steps = steps;
    if (category) recipe.category = category;
    if (prepTime) recipe.prepTime = prepTime;
    if (cookTime) recipe.cookTime = cookTime;
    if (servings) recipe.servings = servings;

    // 🔹 Procesar nueva imagen si se sube una
    if (req.file) {
      console.log("📸 Nueva imagen recibida:", req.file);
      await deleteImage(recipe.image); // Eliminar imagen anterior de Cloudinary
      const result = await uploadImage(req.file.buffer); // Subir nueva imagen
      recipe.image = result.secure_url; // Guardar nueva URL
    }

    await recipe.save();
    res.json({ message: "Receta actualizada", recipe });
  } catch (error) {
    console.error("❌ Error al actualizar receta:", error);
    res.status(500).json({ message: "Error al actualizar receta", error });
  }
};


const deleteRecipe = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "No tienes permiso para eliminar recetas" });

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
    const { category } = req.params;


    const validCategories = ["Desayuno", "Comida", "Merienda", "Cena"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Categoría inválida" });
    }


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
