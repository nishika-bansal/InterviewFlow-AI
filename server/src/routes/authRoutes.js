const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  validateRequest,
  login
);

router.get("/me", protect, getMe);

router.patch(
  "/profile",
  protect,
  [
    body("name").optional().trim().isLength({ min: 2 }).withMessage("Name is too short"),
    body("skills").optional().isArray().withMessage("Skills must be an array")
  ],
  validateRequest,
  updateProfile
);

router.patch(
  "/password",
  protect,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
  ],
  validateRequest,
  changePassword
);

module.exports = router;
