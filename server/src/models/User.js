const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    targetRole: { type: String, trim: true },
    experienceLevel: {
      type: String,
      enum: ["fresher", "junior", "mid", "senior"],
      default: "fresher"
    },
    skills: [{ type: String, trim: true }]
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    profile: {
      type: profileSchema,
      default: () => ({})
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
