const express = require("express");
const {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipesByCategory,
} = require("../controllers/Recipe");
const { isLoggedIn, isAdmin } = require("../../middlewares/auth");
const { uploadImage, deleteImage } = require("../../utils/cloudinary");
const multer = require("multer");
const cloudinary = require("../../utils/cloudinary");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Guardar temporalmente antes de subir a Cloudinary
  },
  filename: (req, file, cb) => {
    cb(null, `recipe_${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

const router = express.Router();

router.get("/category/:category", getRecipesByCategory);
router.get("/", getAllRecipes);
router.get("/:id", getRecipeById);

router.post("/", isLoggedIn, isAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Debe subir una imagen" });

    const imageUpload = await uploadImage(req.file.path);
    req.body.image = imageUpload.secure_url;

    await createRecipe(req, res);
  } catch (error) {
    res.status(500).json({ message: "Error al subir imagen a Cloudinary", error });
  }
});

router.put("/:id", isLoggedIn, isAdmin, upload.single("image"), async (req, res) => {
  try {
    if (req.file) {
      const imageUpload = await uploadImage(req.file.path);
      req.body.image = imageUpload.secure_url;
    }
    await updateRecipe(req, res);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar receta", error });
  }
});

router.delete("/:id", isLoggedIn, isAdmin, deleteRecipe);

module.exports = router;
