const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateSign } = require("../../config/jwt");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Registro de usuario
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "El email ya está en uso" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error en el registro", error });
  }
};

// Login de usuario
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    const token = generateSign(user._id);

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el login", error });
  }
};

// Obtener perfil del usuario (requiere autenticación)
const getUserProfile = async (req, res) => {
  try {
    res.json(req.user); // `req.user` viene del middleware `isLoggedIn`
  } catch (error) {
    res.status(500).json({ message: "Error al obtener perfil", error });
  }
};

// Actualizar usuario (nombre, email)
const updateUser = async (req, res) => {
  try {
    const { username, email } = req.body;
    req.user.username = username || req.user.username;
    req.user.email = email || req.user.email;

    await req.user.save();
    res.json({ message: "Perfil actualizado", user: req.user });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar usuario", error });
  }
};

// Cambiar contraseña
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!(await bcrypt.compare(oldPassword, req.user.password))) {
      return res.status(400).json({ message: "La contraseña antigua no es correcta" });
    }

    req.user.password = await bcrypt.hash(newPassword, 10);
    await req.user.save();

    res.json({ message: "Contraseña cambiada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al cambiar contraseña", error });
  }
};

// Olvidé mi contraseña (envío de correo con código)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const resetToken = uuidv4();
    user.resetToken = resetToken;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Recuperación de contraseña",
      text: `Tu código de recuperación es: ${resetToken}`,
    });

    res.json({ message: "Correo de recuperación enviado" });
  } catch (error) {
    res.status(500).json({ message: "Error en la recuperación", error });
  }
};

// Restablecer contraseña
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    const user = await User.findOne({ resetToken });

    if (!user) return res.status(400).json({ message: "Token inválido" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    await user.save();

    res.json({ message: "Contraseña restablecida" });
  } catch (error) {
    res.status(500).json({ message: "Error al restablecer contraseña", error });
  }
};

// Eliminar cuenta de usuario
const deleteUser = async (req, res) => {
  try {
    await req.user.deleteOne();
    res.json({ message: "Cuenta eliminada" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar cuenta", error });
  }
};

// ADMIN: Obtener lista de usuarios
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error });
  }
};

// ADMIN: Eliminar usuario por ID
const deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "Usuario eliminado por admin" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario", error });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
  deleteUser,
  getAllUsers,
  deleteUserByAdmin,
};
