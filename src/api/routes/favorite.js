const express = require("express");
const { addRecipeToFavorites, removeRecipeFromFavorites, getUserFavorites } = require("../controllers/favorite");
const { isLoggedIn } = require("../../middlewares/auth");

const router = express.Router();

// Favoritos
router.get("/", isLoggedIn, getUserFavorites);
router.post("/", isLoggedIn, addRecipeToFavorites);
router.delete("/", isLoggedIn, removeRecipeFromFavorites);

module.exports = router;
