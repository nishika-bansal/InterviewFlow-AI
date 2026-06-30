const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["hr", "technical", "project", "behavioral", "follow-up"],
      required: true
    },
    question: { type: String, required: true, trim: true },
    expectedAnswer: { type: String, trim: true },
    skill: { type: String, trim: true },
    followUps: [{ type: String, trim: true }],
    isFavorite: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId },
    question: { type: String, trim: true },
    answer: { type: String, trim: true },
    feedback: {
      strengths: [{ type: String, trim: true }],
      weaknesses: [{ type: String, trim: true }],
      suggestions: [{ type: String, trim: true }],
      score: { type: Number, min: 0, max: 100, default: 0 },
      summary: { type: String, trim: true }
    }
  },
  { timestamps: true }
);

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume"
    },
    title: { type: String, trim: true },
    category: {
      type: String,
      enum: ["mixed", "hr", "technical", "project", "behavioral"],
      default: "mixed"
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium"
    },
    company: { type: String, trim: true },
    questions: [questionSchema],
    answers: [answerSchema],
    feedback: {
      strengths: [{ type: String, trim: true }],
      weaknesses: [{ type: String, trim: true }],
      suggestions: [{ type: String, trim: true }],
      score: { type: Number, min: 0, max: 100, default: 0 },
      summary: { type: String, trim: true }
    },
    status: {
      type: String,
      enum: ["generated", "evaluated"],
      default: "generated"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
