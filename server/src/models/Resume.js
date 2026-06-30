const mongoose = require("mongoose");

const resumeAnalysisSchema = new mongoose.Schema(
  {
    skills: [{ type: String, trim: true }],
    projects: [{ type: String, trim: true }],
    education: [{ type: String, trim: true }],
    experience: [{ type: String, trim: true }],
    missingSkills: [{ type: String, trim: true }],
    summary: { type: String, trim: true },
    improvementSuggestions: [{ type: String, trim: true }],
    score: { type: Number, min: 0, max: 100, default: 0 },
    targetRole: { type: String, trim: true },
    analyzedAt: Date
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    text: { type: String, default: "" },
    analysis: {
      type: resumeAnalysisSchema,
      default: () => ({})
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
