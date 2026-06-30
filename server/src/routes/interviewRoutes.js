const express = require("express");
const { body } = require("express-validator");
const {
  generateInterview,
  listInterviews,
  getInterview,
  toggleFavoriteQuestion,
  evaluateInterview,
  exportReport
} = require("../controllers/interviewController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(protect);

router.get("/", listInterviews);
router.post(
  "/generate",
  [
    body("difficulty")
      .optional()
      .isIn(["easy", "medium", "hard"])
      .withMessage("Difficulty must be easy, medium or hard"),
    body("category")
      .optional()
      .isIn(["mixed", "hr", "technical", "project", "behavioral"])
      .withMessage("Invalid category"),
    body("company").optional().trim(),
    body("count").optional().isInt({ min: 3, max: 15 }).withMessage("Count must be 3 to 15")
  ],
  validateRequest,
  generateInterview
);
router.get("/:id", getInterview);
router.patch("/:id/questions/:questionId/favorite", toggleFavoriteQuestion);
router.post(
  "/:id/evaluate",
  [body("answers").isArray({ min: 1 }).withMessage("Answers are required")],
  validateRequest,
  evaluateInterview
);
router.get("/:id/report", exportReport);

module.exports = router;
