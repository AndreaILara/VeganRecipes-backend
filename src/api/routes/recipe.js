const express = require("express");
const multer = require("multer");
const { createRecipe, updateRecipe, deleteRecipe, getAllRecipes, getRecipeById, getRecipesByCategory } = require("../controllers/Recipe");
const { isLoggedIn, isAdmin } = require("../../middlewares/auth");

const upload = multer({ storage: multer.memoryStorage() }); // Almacena la imagen en memoria

const router = express.Router();

router.get("/category/:category", getRecipesByCategory);
router.get("/", getAllRecipes);
router.get("/:id", getRecipeById);

// 🔹 Subir receta (solo admins), ahora con `multer.memoryStorage()`
router.post("/", isLoggedIn, isAdmin, upload.single("image"), createRecipe);

// 🔹 Editar receta (solo admins), también con `multer.memoryStorage()`
router.put("/:id", isLoggedIn, isAdmin, upload.single("image"), updateRecipe);

// 🔹 Eliminar receta (solo admins)
router.delete("/:id", isLoggedIn, isAdmin, deleteRecipe);

module.exports = router;
