import { body } from "express-validator";

const isStrongPassword = (pass: string) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  return regex.test(pass);
};

export const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 2, max: 15 })
    .withMessage("Username must be 2-15 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers and underscores"),

  body("email").trim().isEmail().normalizeEmail(),

  body("password").custom((password) => {
    if (!isStrongPassword(password))
      throw new Error(
        "Password must be at least 8 characters, include uppercase, lowercase, number and special character"
      );
    return true;
  }),
];

export const updateUserValidation = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 2, max: 15 })
    .withMessage("Username must be 2-15 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers and underscores"),

  body("password")
    .optional()
    .custom((password) => {
      if (!isStrongPassword(password))
        throw new Error(
          "Password must be at least 8 characters, include uppercase, lowercase, number and special character"
        );
      return true;
    }),
];
