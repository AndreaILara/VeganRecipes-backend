const User = require("../models/User");
const Recipe = require("../models/Recipe");
const bcrypt = require("bcryptjs");
const { generateSign } = require("../../config/jwt");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "El email ya está en uso" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role === "admin" ? "admin" : "user"
    });

    await newUser.save();


    await transporter.sendMail({
      from: `"Tu Rincón Vegano" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "¡Bienvenid@ a Tu Rincón Vegano! 🌱",
      html: `
      <div style="text-align: center; font-family: Arial, sans-serif; padding: 20px;">
        <img src="https://res.cloudinary.com/dyhasskhz/image/upload/v1741272763/Tu_RInc%C3%B3n_vegano_logo_pnbbaq.png" width="150" alt="Tu Rincón Vegano" />
        <h2 style="color: #8cc342;">Hola ${username}, bienvenido a Tu Rincón Vegano</h2>
        <p>Explora y disfruta nuestras recetas veganas. 🌿</p>
        <p>¡Esperamos que te encante esta experiencia!</p>
        <a href="https://turinconvegano.com" style="display: inline-block; padding: 10px 15px; color: white; background-color: #8cc342; text-decoration: none; border-radius: 5px;">Visitar la web</a>
      </div>
    `,
    });

    res.status(201).json({ message: "Usuario registrado correctamente", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error en el registro", error });
  }
};


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


const getUserProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener perfil", error });
  }
};

const updateUser = async (req, res) => {
  try {
    const { username, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { username, email },
      { new: true, runValidators: true, omitUndefined: true }
    );

    res.json({ message: "Perfil actualizado", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar usuario", error });
  }
};

// Cambiar contraseña
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(400).json({ message: "La contraseña antigua no es correcta" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

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

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }


    const resetToken = crypto.randomInt(100000, 999999).toString();


    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000;
    await user.save();

    await transporter.sendMail({
      from: `"Tu Rincón Vegano" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Recuperación de contraseña 🔑",
      html: `
        <div style="text-align: center; font-family: Arial, sans-serif; padding: 20px;">
          <img src="https://res.cloudinary.com/dyhasskhz/image/upload/v1741272763/Tu_RInc%C3%B3n_vegano_logo_pnbbaq.png" width="150" alt="Tu Rincón Vegano" />
          <h2 style="color: #8cc342;">Recupera tu contraseña</h2>
          <p>Tu código de recuperación es:</p>
          <h1 style="background: #f4f4f4; padding: 10px; display: inline-block;">${resetToken}</h1>
          <p>Este código expira en 1 hora.</p>
          <p>Si no solicitaste este cambio, ignora este correo.</p>
        </div>
      `,
    });

    res.json({ message: "Correo de recuperación enviado" });
  } catch (error) {
    res.status(500).json({ message: "Error al enviar correo de recuperación", error });
  }
};

// Restablecer contraseña
const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const user = await User.findOne({ email, resetToken });

    // Verificar si el código es correcto y no ha expirado
    if (!user || user.resetTokenExpires < Date.now()) {
      return res.status(400).json({ message: "Código inválido o expirado" });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Eliminar el token de recuperación
    user.resetToken = null;
    user.resetTokenExpires = null;

    await user.save();

    await transporter.sendMail({
      from: `"Tu Rincón Vegano" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Tu contraseña ha sido cambiada ✅",
      html: `
        <div style="text-align: center; font-family: Arial, sans-serif; padding: 20px;">
          <img src="https://res.cloudinary.com/dyhasskhz/image/upload/v1741272763/Tu_RInc%C3%B3n_vegano_logo_pnbbaq.png" width="150" alt="Tu Rincón Vegano" />
          <h2 style="color: #8cc342">Tu contraseña ha sido actualizada</h2>
          <p>Si no realizaste este cambio, por favor contacta a nuestro soporte.</p>
          <p>¡Gracias por formar parte de nuestra comunidad vegana! 🌿</p>
        </div>
      `,
    });

    res.json({ message: "Contraseña restablecida correctamente" });
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


const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error });
  }
};

const deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "Usuario eliminado por admin" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario", error });
  }
};
const getUserFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favoriteRecipes", "title image category");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ favorites: user.favoriteRecipes });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener favoritos", error });
  }
};

const addRecipeToFavorites = async (req, res) => {
  try {
    const { recipeId } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.favoriteRecipes.includes(recipeId)) {
      return res.status(400).json({ message: "Esta receta ya está en favoritos" });
    }

    user.favoriteRecipes.push(recipeId);
    await user.save();

    res.json({ message: "Receta añadida a favoritos", favorites: user.favoriteRecipes });
  } catch (error) {
    res.status(500).json({ message: "Error al añadir a favoritos", error });
  }
};


const removeRecipeFromFavorites = async (req, res) => {
  try {
    const { recipeId } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    user.favoriteRecipes = user.favoriteRecipes.filter(
      (fav) => fav.toString() !== recipeId
    );

    await user.save();

    res.json({ message: "Receta eliminada de favoritos", favorites: user.favoriteRecipes });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar de favoritos", error });
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
  deleteUserByAdmin, getUserFavorites, addRecipeToFavorites, removeRecipeFromFavorites
};