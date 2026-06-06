const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
    return next(new AppError(message, 400));
  }
  next();
};

module.exports = { validate };
