const express = require("express");
const { body } = require("express-validator");
const {
  uploadResume,
  replaceResume,
  listResumes,
  getActiveResume,
  getResume,
  previewResume,
  analyzeResume,
  deleteResume
} = require("../controllers/resumeController");
const { protect } = require("../middleware/authMiddleware");
const { uploadResume: uploadMiddleware } = require("../middleware/uploadMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(protect);

router.get("/", listResumes);
router.get("/active", getActiveResume);
router.post("/", uploadMiddleware.single("resume"), uploadResume);
router.put("/:id/replace", uploadMiddleware.single("resume"), replaceResume);
router.get("/:id", getResume);
router.get("/:id/preview", previewResume);
router.post(
  "/:id/analyze",
  [body("targetRole").optional().trim().isLength({ min: 2 }).withMessage("Target role is too short")],
  validateRequest,
  analyzeResume
);
router.delete("/:id", deleteResume);

module.exports = router;
