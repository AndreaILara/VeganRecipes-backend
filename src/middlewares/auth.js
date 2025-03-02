const User = require('../api/models/User');
const { verifyJWT } = require('../config/jwt');

const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res
        .status(401)
        .json('No estás autorizado para realizar esta acción');
    }
    const { id } = verifyJWT(token);
    const user = await User.findById(id);
    user.password = null;
    // paso a la siguiente función una versión del usuario sin el password
    req.user = user;
    next();
  } catch (error) {
    next(error);
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