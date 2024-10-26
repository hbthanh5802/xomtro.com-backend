import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';

const IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10mb
const VIDEO_MAX_SIZE = 50 * 1024 * 1024;

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const fileType = file.mimetype.split('/')[0];
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/mpeg'];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(null, false);
    return;
  }

  if (fileType === 'image' && file.size > IMAGE_MAX_SIZE) {
    return cb(null, false);
  }

  if (fileType === 'video' && file.size > VIDEO_MAX_SIZE) {
    return cb(null, false);
  }

  return cb(null, true);
};

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: Math.max(IMAGE_MAX_SIZE, VIDEO_MAX_SIZE)
  }
});
