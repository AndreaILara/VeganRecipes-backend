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
const validarContraseña = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
  return regex.test(password);
};


const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const role = "user";

    // 🔎 Verificar si el correo ya está en uso
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "El email ya está en uso" });
    }

    // 🔎 Verificar si el nombre de usuario ya está en uso
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
    }

    // ✅ Validar la contraseña
    if (!validarContraseña(password)) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial.",
      });
    }

    // 🔒 Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 📝 Crear nuevo usuario
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });


    await newUser.save();

    // 📧 Enviar correo de bienvenida
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

    res.status(201).json({ message: "✅ Usuario registrado correctamente", user: newUser });
  } catch (error) {
    console.error("❌ Error en el registro:", error);
    res.status(500).json({ message: "Error en el registro, intenta nuevamente.", error });
  }
};
const checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ exists: false, message: "Falta el email" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al verificar email", error });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Correo no registrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const token = generateSign(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      },
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
    const { username, avatar, password, email } = req.body;

    if (email && email !== req.user.email) {
      return res.status(400).json({ message: "No puedes cambiar el email desde aquí" });
    }

    let updateData = { username };

    if (avatar) {
      updateData.avatar = avatar;
    }

    if (password) {
      if (!validarContraseña(password)) {
        return res.status(400).json({
          message: "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial.",
        });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true, omitUndefined: true }
    );

    res.json({ message: "Perfil actualizado", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar usuario", error });
  }
};



const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(400).json({ message: "La contraseña antigua no es correcta" });
    }

    if (!validarContraseña(newPassword)) {
      return res.status(400).json({
        message: "La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Contraseña cambiada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al cambiar contraseña", error });
  }
};

// 🔥 Olvidé mi contraseña (envío de correo con código)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 🛠️ Eliminar código previo si existía antes de generar uno nuevo
    await User.updateOne(
      { email },
      { $unset: { resetToken: "", resetTokenExpires: "" } }
    );

    // 🛠️ Generar un único código de 6 dígitos
    const resetToken = crypto.randomInt(100000, 999999).toString();
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // Expira en 1 hora

    await user.save(); // Guardar SOLO UNA VEZ


    // Enviar el código por email
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
    console.error("❌ Error en forgotPassword:", error);
    res.status(500).json({ message: "Error al enviar correo de recuperación", error });
  }
};

// 🔥 Restablecer contraseña
const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const user = await User.findOne({ email });

    if (!user || user.resetToken !== resetToken || user.resetTokenExpires < Date.now()) {
      return res.status(400).json({ message: "Código inválido o expirado" });
    }

    if (!validarContraseña(newPassword)) {
      return res.status(400).json({
        message: "La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await User.updateOne(
      { email },
      { $unset: { resetToken: "", resetTokenExpires: "" } }
    );

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
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Guardamos el email antes de eliminar el usuario
    const userEmail = user.email;

    // Eliminamos el usuario de la base de datos
    await User.findByIdAndDelete(id);

    // Enviar correo de notificación
    await transporter.sendMail({
      from: `"Tu Rincón Vegano" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Cuenta eliminada - Tu Rincón Vegano",
      html: `
        <div style="text-align: center; font-family: Arial, sans-serif; padding: 20px;">
          <img src="https://res.cloudinary.com/dyhasskhz/image/upload/v1741272763/Tu_RInc%C3%B3n_vegano_logo_pnbbaq.png" width="150" alt="Tu Rincón Vegano" />
          <h2 style="color: #8cc342;">Tu cuenta ha sido eliminada</h2>
          <p>Hemos decidido eliminar tu cuenta debido al incumplimiento de nuestras normas de comunidad.</p>
          <p>Si crees que esto ha sido un error, puedes ponerte en contacto con nuestro soporte.</p>
          <p>Gracias por tu tiempo en Tu Rincón Vegano.</p>
        </div>
      `,
    });

    res.json({ message: "Usuario eliminado y correo de notificación enviado." });
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

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Receta no encontrada" });
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
  deleteUserByAdmin, getUserFavorites, addRecipeToFavorites, removeRecipeFromFavorites, checkEmailExists
};