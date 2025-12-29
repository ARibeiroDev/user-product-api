import { body } from "express-validator";

// Helper function for url
const isValidUrl = (s: string) => {
  try {
    return Boolean(new URL(s));
  } catch {
    return false;
  }
};

// Create product fields validation chain
const productFields = {
  name: () =>
    body("name")
      .trim()
      .escape()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be 2-100 characters"),

  description: () =>
    body("description")
      .trim()
      .escape()
      .isLength({ min: 10, max: 2000 })
      .withMessage("Description must be 10-2000 characters"),

  images: () =>
    body("images")
      .optional()
      .isArray()
      .withMessage("Images must be an array")
      .bail()
      .custom((arr: unknown[]) =>
        arr.every((url) => typeof url === "string" && isValidUrl(url))
      )
      .withMessage("All images must be valid URLs"),

  category: () =>
    body("category")
      .trim()
      .escape()
      .isLength({ min: 2, max: 50 })
      .withMessage("Category must be 2-50 characters"),

  tags: () =>
    body("tags")
      .optional()
      .isArray()
      .withMessage("Tags must be an array")
      .bail()
      .customSanitizer((arr: unknown[]) =>
        arr
          .filter((t) => typeof t === "string")
          .map((t) => t.trim().toLowerCase())
      ),
};

// Same for variant fields
const variantFields = {
  color: () =>
    body("variants.*.color")
      .trim()
      .escape()
      .isLength({ min: 1, max: 30 })
      .withMessage("Color must be 1-30 characters"),

  size: () =>
    body("variants.*.size")
      .trim()
      .escape()
      .isLength({ min: 1, max: 20 })
      .withMessage("Size must be 1-20 characters"),

  price: () =>
    body("variants.*.price")
      .toFloat()
      .bail()
      .isFloat({ min: 0 })
      .withMessage("Price can't be lower than 0"),

  stock: () =>
    body("variants.*.stock")
      .toInt()
      .bail()
      .isInt({ min: 0 })
      .withMessage("Stock can't be lower than 0"),

  discount: () =>
    body("variants.*.discount")
      .optional()
      .toFloat()
      .bail()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Discount must be between 0 and 100"),
};

export const createProductValidation = [
  productFields.name().notEmpty().withMessage("Name is required").bail(),
  productFields
    .description()
    .notEmpty()
    .withMessage("Description is required")
    .bail(),
  productFields
    .category()
    .notEmpty()
    .withMessage("Category is required")
    .bail(),

  body("variants")
    .isArray({ min: 1 })
    .withMessage("At least one variant is required")
    .bail(),

  variantFields
    .color()
    .notEmpty()
    .withMessage("Color variant is required")
    .bail(),
  variantFields
    .size()
    .notEmpty()
    .withMessage("Size variant is required")
    .bail(),
  variantFields.price(),
  variantFields.stock(),
  variantFields.discount(),
];

export const updateProductValidation = [
  productFields
    .name()
    .optional()
    .notEmpty()
    .withMessage("Name is required")
    .bail(),
  productFields
    .description()
    .optional()
    .notEmpty()
    .withMessage("Description is required")
    .bail(),
  productFields
    .category()
    .optional()
    .notEmpty()
    .withMessage("Category is required")
    .bail(),
  productFields.images(),
  productFields.tags(),

  body("variants")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one variant is required")
    .bail(),

  variantFields
    .color()
    .optional()
    .notEmpty()
    .withMessage("Color variant is required")
    .bail(),
  variantFields
    .size()
    .optional()
    .notEmpty()
    .withMessage("Size variant is required")
    .bail(),
  variantFields.price().optional(),
  variantFields.stock().optional(),
  variantFields.discount().optional(),
];

export const addVariantValidation = [
  variantFields.color().notEmpty().withMessage("Color is required").bail(),
  variantFields.size().notEmpty().withMessage("Size is required").bail(),
  variantFields.price(),
  variantFields.stock(),
  variantFields.discount(),
];

export const updateVariantValidation = [
  body("color").optional().notEmpty().withMessage("Color is required").bail(),
  body("size").optional().notEmpty().withMessage("Size is required").bail(),
  body("price").optional(),
  body("stock").optional(),
  body("discount").optional(),
];
