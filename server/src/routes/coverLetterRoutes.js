const express = require("express");
const { body } = require("express-validator");
const { createCoverLetter } = require("../controllers/coverLetterController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post(
  "/",
  protect,
  [
    body("role").optional().trim(),
    body("company").optional().trim(),
    body("jobDescription").optional().trim()
  ],
  validateRequest,
  createCoverLetter
);

module.exports = router;
