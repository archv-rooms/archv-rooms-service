import multer from 'multer';

const ALLOWED_MIME_TYPES = [
  // imagens
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',

  // vídeos
  'video/mp4',
  'video/webm',

  // arquivos de rom/room
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/vnd.rar',
  'application/x-7z-compressed',
  'application/octet-stream',
];

const MAX_SIZE_MB = 100;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_SIZE_MB * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
    }
  },
});