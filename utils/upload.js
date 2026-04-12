import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format'));
    }
  }
});

export function generateStoragePath(originalname) {
  const now = new Date();
  const year = now.getFullYear();
  const ext = path.extname(originalname).toLowerCase();
  const name = Date.now() + '-' + Math.random().toString(36).substring(2, 8);
  return `${year}/${name}${ext}`;
}
