const express = require("express");
const { addComment, deleteComment, getCommentsByRecipe } = require("../controllers/comment");
const { isLoggedIn, isAdmin } = require("../../middlewares/auth");

const router = express.Router();

// Comentarios en recetas
router.get("/:recipeId", getCommentsByRecipe);
router.post("/", isLoggedIn, addComment);
router.delete("/:id", isLoggedIn, deleteComment);

module.exports = router;
