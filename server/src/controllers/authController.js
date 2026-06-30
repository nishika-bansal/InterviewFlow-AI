const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");

function createToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw httpError(500, "JWT_SECRET is missing. Add it to server/.env");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}

function userResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    createdAt: user.createdAt
  };
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw httpError(409, "Email is already registered");
  }

  const user = await User.create({ name, email, password });
  const token = createToken(user._id);

  res.status(201).json({
    token,
    user: userResponse(user)
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw httpError(401, "Invalid email or password");
  }

  const token = createToken(user._id);
  res.json({
    token,
    user: userResponse(user)
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ user: userResponse(req.user) });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, location, targetRole, experienceLevel, skills } = req.body;
  const user = await User.findById(req.user._id);
  const currentProfile =
    user.profile && typeof user.profile.toObject === "function" ? user.profile.toObject() : {};

  if (name) user.name = name;
  user.profile = {
    ...currentProfile,
    phone,
    location,
    targetRole,
    experienceLevel,
    skills: Array.isArray(skills) ? skills : currentProfile.skills
  };

  await user.save();
  res.json({ user: userResponse(user) });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    throw httpError(400, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: "Password changed successfully" });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};
