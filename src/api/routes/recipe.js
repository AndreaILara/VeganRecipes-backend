const express = require("express");
const multer = require("multer");
const { createRecipe, updateRecipe, deleteRecipe, getAllRecipes, getRecipeById, getRecipesByCategory } = require("../controllers/Recipe");
const { isLoggedIn, isAdmin } = require("../../middlewares/auth");

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get("/category/:category", getRecipesByCategory);
router.get("/", getAllRecipes);
router.get("/:id", getRecipeById);


router.post("/", isLoggedIn, isAdmin, upload.single("image"), createRecipe);
router.put("/:id", isLoggedIn, isAdmin, upload.single("image"), updateRecipe);
router.delete("/:id", isLoggedIn, isAdmin, deleteRecipe);

module.exports = router;
