const User = require('../api/models/User');
const { verifyJWT } = require('../config/jwt');

const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No estás autorizado para realizar esta acción" });
    }

    const { id } = verifyJWT(token);
    const user = await User.findById(id);

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    req.user = user;
    req.user.password = undefined;

    next();
  } catch (error) {
    res.status(500).json({ message: "Error de autenticación", error });
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