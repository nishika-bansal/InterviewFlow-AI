const path = require("path");
const multer = require("multer");
const { ensureUploadDir } = require("../utils/fileSystem");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ensureUploadDir());
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname) || ".pdf";
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, safeName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    return cb(null, true);
  }

  return cb(new Error("Only PDF resumes are allowed"));
};

const maxSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 5);

const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSizeMb * 1024 * 1024
  }
});

module.exports = {
  uploadResume
};
