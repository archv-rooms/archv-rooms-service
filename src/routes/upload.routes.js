import { Router } from 'express';
import { upload } from '../config/multer.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

const router = Router();

router.post('/',
  (req, res, next) => {
    console.log('✅ Requisição chegou');
    console.log('Content-Type:', req.headers['content-type']);
    next();
  },
  upload.single('file'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    try {
      const isVideo = req.file.mimetype.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'image';

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: resourceType, folder: 'archv-rooms' },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      return res.status(200).json({ url: result.secure_url });
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Erro no upload.' });
    }
  }
);

export default router;