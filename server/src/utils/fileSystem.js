const fs = require("fs");
const path = require("path");

function getUploadDir() {
  return path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads");
}

function ensureUploadDir() {
  const uploadDir = getUploadDir();
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
}

function safeDelete(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

module.exports = {
  ensureUploadDir,
  getUploadDir,
  safeDelete
};
