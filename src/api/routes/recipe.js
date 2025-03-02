const express = require("express");
const { getAllRecipes, getRecipeById, addRecipeToFavorites, removeRecipeFromFavorites, sendSuggestionToAdmin, createRecipe, updateRecipe, deleteRecipe } = require("../controllers/Recipe");
const { isLoggedIn, isAdmin } = require("../../middlewares/auth");
const multer = require("multer");

const upload = multer({ dest: "uploads/" }); // Almacenamiento temporal

const router = express.Router();

// Ver recetas (todos pueden verlas)
router.get("/", getAllRecipes);
router.get("/:id", getRecipeById);

// Usuarios autenticados
router.post("/favorites", isLoggedIn, addRecipeToFavorites);
router.delete("/favorites", isLoggedIn, removeRecipeFromFavorites);
router.post("/suggestion", isLoggedIn, sendSuggestionToAdmin);

// Administradores
router.post("/", isLoggedIn, isAdmin, upload.single("image"), createRecipe);
router.put("/:id", isLoggedIn, isAdmin, upload.single("image"), updateRecipe);
router.delete("/:id", isLoggedIn, isAdmin, deleteRecipe);

module.exports = router;
