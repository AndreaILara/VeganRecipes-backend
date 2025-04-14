const User = require('../api/models/User');
const { verifyJWT } = require('../config/jwt');

// Middleware para comprobar si el usuario está autenticado
const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    console.log("🔐 TOKEN RECIBIDO:", token); // 🐞 LOG 1

    if (!token) {
      console.warn("⚠️ No hay token en la petición.");
      return res.status(401).json({ message: "No estás autorizado para realizar esta acción" });
    }

    const decoded = verifyJWT(token);
    console.log("🧾 DECODED TOKEN:", decoded); // 🐞 LOG 2

    if (!decoded || !decoded.id) {
      console.warn("⚠️ Token inválido o expirado.");
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    const user = await User.findById(decoded.id).select("-password");
    console.log("👤 USUARIO AUTENTICADO:", user); // 🐞 LOG 3

    if (!user) {
      console.warn("⚠️ Usuario no encontrado.");
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Error en autenticación:", error.message);
    res.status(401).json({ message: "Error de autenticación", error: error.message });
  }
};

// Middleware para comprobar si el usuario es admin
const isAdmin = (req, res, next) => {
  try {
    console.log("🛂 REQ.USER EN isAdmin:", req.user); // 🐞 LOG 4

    if (req.user.role === 'admin') {
      return next();
    } else {
      console.warn("⛔ Usuario no es admin");
      return res.status(403).json({ message: 'Sólo los administradores pueden realizar esta acción.' });
    }
  } catch (error) {
    console.error("❌ Error en comprobación de rol:", error.message);
    res.status(500).json({ message: "Error de servidor al comprobar rol", error: error.message });
  }
};

module.exports = {
  isLoggedIn,
  isAdmin
};
