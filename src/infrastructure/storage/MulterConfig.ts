import multer from 'multer';
import { Request } from 'express';

// Memory storage (files stored in memory as Buffer)
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  const allowedTypes = (process.env.ALLOWED_IMAGE_TYPES || '').split(',');

  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new Error(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      )
    );
  }
};

// Multer configuration
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB default
  },
}).single('image');

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
    files: parseInt(process.env.MAX_FILES_PER_UPLOAD || '5', 10),
  },
}).array('images', parseInt(process.env.MAX_FILES_PER_UPLOAD || '5', 10));
