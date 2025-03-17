const User = require('../api/models/User');
const { verifyJWT } = require('../config/jwt');

const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      console.warn("⚠️ No hay token en la petición.");
      return res.status(401).json({ message: "No estás autorizado para realizar esta acción" });
    }

    const decoded = verifyJWT(token);
    if (!decoded || !decoded.id) {
      console.warn("⚠️ Token inválido o expirado.");
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      console.warn("⚠️ Usuario no encontrado.");
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    req.user = user;
    req.user.password = undefined;

    next();
  } catch (error) {
    console.error("❌ Error en autenticación:", error.message);
    res.status(401).json({ message: "Error de autenticación", error: error.message });
  }
};


const isAdmin = (req, res, next) => {
  try {
    return req.user.role === 'admin'
      ? next()
      : res
        .status(401)
        .json('Sólo los administradores pueden realizar esta acción.');
  } catch (error) {
    next(error);
  }
};

module.exports = { isLoggedIn, isAdmin };