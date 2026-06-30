const Resume = require("../models/Resume");
const { generateCoverLetter } = require("../services/geminiService");
const asyncHandler = require("../utils/asyncHandler");

const createCoverLetter = asyncHandler(async (req, res) => {
  const { company, role, jobDescription } = req.body;
  const resume = await Resume.findOne({ user: req.user._id, isActive: true }).sort({
    createdAt: -1
  });

  const result = await generateCoverLetter({
    user: req.user,
    resumeAnalysis: resume ? resume.analysis : req.user.profile,
    company,
    role,
    jobDescription
  });

  res.json(result);
});

module.exports = {
  createCoverLetter
};
