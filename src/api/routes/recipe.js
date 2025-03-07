const express = require("express");
const {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipesByCategory
} = require("../controllers/Recipe");
const { isLoggedIn, isAdmin } = require("../../middlewares/auth");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../utils/cloudinary"); // ✅ Importa Cloudinary correctamente

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "vegan_recipes", // Carpeta en Cloudinary
    format: async (req, file) => {
      const formats = ["png", "jpg", "jpeg", "webp"];
      const ext = file.mimetype.split("/")[1]; // Extrae la extensión del mimetype
      return formats.includes(ext) ? ext : "png"; // Usa el formato original si es válido, si no, usa "png"
    },
    public_id: (req, file) => file.originalname.split(".")[0], // Usa el nombre original sin extensión
  },
});

const upload = multer({ storage }); // ✅ Ahora `upload` está definido

const router = express.Router();

// 📌 DEFINICIÓN DE RUTAS

// Obtener recetas por categoría
router.get("/category/:category", getRecipesByCategory);

// Obtener todas las recetas
router.get("/", getAllRecipes);

// Obtener una receta por ID
router.get("/:id", getRecipeById);

// 📌 SOLO ADMIN: CRUD de recetas con imágenes en Cloudinary
router.post("/", isLoggedIn, isAdmin, upload.single("image"), createRecipe);
router.put("/:id", isLoggedIn, isAdmin, upload.single("image"), updateRecipe);
router.delete("/:id", isLoggedIn, isAdmin, deleteRecipe);

module.exports = router;
