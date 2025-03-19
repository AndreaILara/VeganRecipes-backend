const express = require("express");
const { addComment, deleteComment, getCommentsByRecipe } = require("../controllers/comment");
const { isLoggedIn } = require("../../middlewares/auth");

const router = express.Router();

router.post("/", isLoggedIn, addComment);
router.delete("/:id", isLoggedIn, deleteComment);
router.get("/:recipeId", getCommentsByRecipe);

module.exports = router;
