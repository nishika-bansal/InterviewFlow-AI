const path = require("path");
const Resume = require("../models/Resume");
const { extractPdfText } = require("../services/pdfService");
const { analyzeResumeText } = require("../services/geminiService");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");
const { safeDelete } = require("../utils/fileSystem");

async function buildResumeFromFile(req, isActive = true) {
  if (!req.file) {
    throw httpError(400, "Resume PDF is required");
  }

  let text = "";
  try {
    text = await extractPdfText(req.file.path);
  } catch (error) {
    text = "";
  }

  return Resume.create({
    user: req.user._id,
    originalName: req.file.originalname,
    fileName: req.file.filename,
    filePath: req.file.path,
    mimeType: req.file.mimetype,
    size: req.file.size,
    text,
    isActive
  });
}

const uploadResume = asyncHandler(async (req, res) => {
  await Resume.updateMany({ user: req.user._id }, { isActive: false });
  const resume = await buildResumeFromFile(req, true);

  res.status(201).json({
    message: "Resume uploaded successfully",
    resume
  });
});

const replaceResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw httpError(400, "Resume PDF is required");
  }

  const currentResume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!currentResume) {
    throw httpError(404, "Resume not found");
  }

  currentResume.isActive = false;
  await currentResume.save();

  const resume = await buildResumeFromFile(req, true);
  res.status(201).json({
    message: "Resume replaced successfully",
    resume
  });
});

const listResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ resumes });
});

const getActiveResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ user: req.user._id, isActive: true }).sort({ createdAt: -1 });
  res.json({ resume });
});

const getResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) {
    throw httpError(404, "Resume not found");
  }

  res.json({ resume });
});

const previewResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) {
    throw httpError(404, "Resume not found");
  }

  res.sendFile(path.resolve(resume.filePath));
});

const analyzeResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) {
    throw httpError(404, "Resume not found");
  }

  const targetRole = req.body.targetRole || req.user.profile.targetRole || "Software Developer";
  const analysis = await analyzeResumeText({
    resumeText: resume.text,
    targetRole
  });

  resume.analysis = {
    ...analysis,
    analyzedAt: new Date()
  };
  await resume.save();

  res.json({
    message: "Resume analyzed successfully",
    resume
  });
});

const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) {
    throw httpError(404, "Resume not found");
  }

  safeDelete(resume.filePath);
  await resume.deleteOne();

  res.json({ message: "Resume deleted successfully" });
});

module.exports = {
  uploadResume,
  replaceResume,
  listResumes,
  getActiveResume,
  getResume,
  previewResume,
  analyzeResume,
  deleteResume
};
