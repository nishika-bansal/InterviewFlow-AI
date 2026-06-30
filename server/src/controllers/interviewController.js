const Interview = require("../models/Interview");
const Resume = require("../models/Resume");
const {
  generateInterviewQuestions,
  evaluateInterviewAnswers
} = require("../services/geminiService");
const { streamInterviewReport } = require("../services/reportService");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");

const allowedTypes = ["hr", "technical", "project", "behavioral", "follow-up"];

function normalizeQuestion(question) {
  const rawType = String(question.type || "technical").toLowerCase();
  const type = allowedTypes.includes(rawType)
    ? rawType
    : rawType.includes("follow")
      ? "follow-up"
      : "technical";

  return {
    type,
    question: question.question || "Explain one project from your resume.",
    expectedAnswer: question.expectedAnswer || "",
    skill: question.skill || "General",
    followUps: Array.isArray(question.followUps) ? question.followUps : []
  };
}

const generateInterview = asyncHandler(async (req, res) => {
  const {
    resumeId,
    difficulty = "medium",
    category = "mixed",
    company = "",
    count = 8
  } = req.body;

  const resume = resumeId
    ? await Resume.findOne({ _id: resumeId, user: req.user._id })
    : await Resume.findOne({ user: req.user._id, isActive: true }).sort({ createdAt: -1 });

  const aiResult = await generateInterviewQuestions({
    resumeAnalysis: resume ? resume.analysis : req.user.profile,
    difficulty,
    category,
    company,
    count
  });

  const interview = await Interview.create({
    user: req.user._id,
    resume: resume ? resume._id : undefined,
    title: `${company || "General"} ${category} interview`,
    category,
    difficulty,
    company,
    questions: (aiResult.questions || []).map(normalizeQuestion)
  });

  res.status(201).json({
    message: "Interview questions generated successfully",
    interview
  });
});

const listInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ user: req.user._id })
    .populate("resume", "originalName analysis.score")
    .sort({ createdAt: -1 });

  res.json({ interviews });
});

const getInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id }).populate(
    "resume"
  );

  if (!interview) {
    throw httpError(404, "Interview not found");
  }

  res.json({ interview });
});

const toggleFavoriteQuestion = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
  if (!interview) {
    throw httpError(404, "Interview not found");
  }

  const question = interview.questions.id(req.params.questionId);
  if (!question) {
    throw httpError(404, "Question not found");
  }

  question.isFavorite = !question.isFavorite;
  await interview.save();

  res.json({ question });
});

const evaluateInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
  if (!interview) {
    throw httpError(404, "Interview not found");
  }

  const submittedAnswers = Array.isArray(req.body.answers) ? req.body.answers : [];
  const feedback = await evaluateInterviewAnswers({
    questions: interview.questions,
    answers: submittedAnswers,
    difficulty: interview.difficulty
  });

  interview.answers = submittedAnswers.map((item) => {
    const question = interview.questions.id(item.questionId);
    return {
      questionId: item.questionId,
      question: question ? question.question : item.question,
      answer: item.answer,
      feedback
    };
  });
  interview.feedback = feedback;
  interview.status = "evaluated";
  await interview.save();

  res.json({
    message: "Interview evaluated successfully",
    interview
  });
});

const exportReport = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
  if (!interview) {
    throw httpError(404, "Interview not found");
  }

  streamInterviewReport(res, interview, req.user);
});

module.exports = {
  generateInterview,
  listInterviews,
  getInterview,
  toggleFavoriteQuestion,
  evaluateInterview,
  exportReport
};
