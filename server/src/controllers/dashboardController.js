const Resume = require("../models/Resume");
const Interview = require("../models/Interview");
const asyncHandler = require("../utils/asyncHandler");

const getDashboard = asyncHandler(async (req, res) => {
  const [activeResume, recentResumes, interviews] = await Promise.all([
    Resume.findOne({ user: req.user._id, isActive: true }).sort({ createdAt: -1 }),
    Resume.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5),
    Interview.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(8)
  ]);

  const evaluated = interviews.filter((item) => item.status === "evaluated");
  const averageScore =
    evaluated.length === 0
      ? 0
      : Math.round(
          evaluated.reduce((total, item) => total + (item.feedback.score || 0), 0) /
            evaluated.length
        );

  res.json({
    activeResume,
    recentResumes,
    interviews,
    stats: {
      resumeScore: activeResume && activeResume.analysis ? activeResume.analysis.score || 0 : 0,
      totalInterviews: interviews.length,
      averageScore,
      favoriteQuestions: interviews.reduce(
        (total, interview) =>
          total + interview.questions.filter((question) => question.isFavorite).length,
        0
      )
    }
  });
});

module.exports = {
  getDashboard
};
