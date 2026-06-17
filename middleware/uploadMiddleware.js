const path = require('path');
const multer = require('multer');

// diskStorage tells Multer where to save uploaded CVs and how to name them.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    // Prefix the original extension with a random timestamp-based name to avoid collisions.
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
  }
});

const allowedExtensions = new Set(['.pdf', '.doc', '.docx']);

// File filtering is a basic safety check so users cannot upload arbitrary file types.
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.has(ext)) {
    return cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  // Limit CV uploads to 5 MB. This protects server disk space.
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
