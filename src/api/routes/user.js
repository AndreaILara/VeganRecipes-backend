const express = require("express");
const { registerUser, loginUser, getUserProfile, updateUser, changePassword, forgotPassword, resetPassword, deleteUser, getAllUsers, deleteUserByAdmin } = require("../controllers/User");
const { isLoggedIn, isAdmin } = require("../../middlewares/auth");

const router = express.Router();

// Autenticación
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", isLoggedIn, getUserProfile);
router.put("/profile", isLoggedIn, updateUser);
router.put("/change-password", isLoggedIn, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.delete("/delete", isLoggedIn, deleteUser);

// Administración (solo admins)
router.get("/", isLoggedIn, isAdmin, getAllUsers);
router.delete("/:id", isLoggedIn, isAdmin, deleteUserByAdmin);

module.exports = router;
