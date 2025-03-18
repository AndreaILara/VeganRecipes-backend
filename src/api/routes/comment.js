const express = require("express");
const { addComment, deleteComment, getCommentsByRecipe } = require("../controllers/comment");
const { isLoggedIn } = require("../../middlewares/auth");

const router = express.Router();

router.post("/", isLoggedIn, addComment); // 📌 Agregar comentario
router.delete("/:id", isLoggedIn, deleteComment); // 📌 Eliminar comentario
router.get("/:recipeId", getCommentsByRecipe); // 📌 Obtener comentarios

module.exports = router;
