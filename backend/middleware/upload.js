const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.memoryStorage();

// File filter - Accept ALL file types
const fileFilter = (req, file, cb) => {
  // Accept all file types - no restrictions
  cb(null, true);

  /* Old file type restrictions - now disabled to support all file types
  const allowedTypes = [
    // Text files
    '.txt', '.text',

    // Documents
    '.pdf', '.docx', '.doc',

    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.svg',

    // Data formats
    '.json', '.xml', '.csv',

    // Other formats
    '.rtf', '.odt', '.htm', '.html'
  ];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Supported formats: ${allowedTypes.join(', ')}`), false);
  }
  */
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = upload;