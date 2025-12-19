const { body, validationResult } = require('express-validator');

const productValidationRules = () => {
  return [
    body('title')
      .trim()
      .notEmpty().withMessage('Product title is required')
      .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),

    body('description')
      .trim()
      .notEmpty().withMessage('Description is required')
      .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),

    body('shortDescription')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Short description must not exceed 500 characters'),

    body('price')
      .notEmpty().withMessage('Price is required')
      .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

    body('discountPrice')
      .optional()
      .isFloat({ min: 0 }).withMessage('Discount price must be a positive number'),

    body('stock')
      .notEmpty().withMessage('Stock is required')
      .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),

    body('sku')
      .optional()
      .trim()
      .isLength({ min: 3 }).withMessage('SKU must be at least 3 characters'),

    body('categoryId')
      .notEmpty().withMessage('Category is required')
      .isInt().withMessage('Category ID must be an integer'),

    body('weight')
      .optional()
      .isFloat({ min: 0 }).withMessage('Weight must be a positive number'),

    body('rating')
      .optional()
      .isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  productValidationRules,
  validate
};
