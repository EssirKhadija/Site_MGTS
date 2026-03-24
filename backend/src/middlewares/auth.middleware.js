const { forbidden } = require('../utils/response');
const { verifyAccessToken } = require('../services/jwt.service');
const { unauthorized } = require('../utils/response');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, 'No token provided');
  } 
  const token = authHeader.split(' ')[1];
  try {
    const user = await verifyAccessToken(token);
    req.user = user; // Attach user info to request
    next();
  } catch (err) {
    return unauthorized(res, 'Invalid or expired token');
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return forbidden(res, 'Not authenticated');
    }
    if (!roles.includes(req.user.role)) {
      return forbidden(res, `Access denied. Required roles: ${roles.join(', ')}`);
    }
    next();
  };
};

module.exports = { authorize, authenticate }; 