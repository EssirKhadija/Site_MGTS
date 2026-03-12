const { forbidden } = require('../utils/response');

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

module.exports = { authorize };