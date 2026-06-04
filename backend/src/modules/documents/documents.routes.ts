import { Router } from 'express';
import multer from 'multer';

import { authenticate } from '../../middlewares/auth.js';

import { DocumentsController } from './documents.controller.js';

export const documentsRoutes = Router();
const controller = new DocumentsController();

// Use memory storage for Multer
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

documentsRoutes.use(authenticate);

documentsRoutes.get('/', (req, res) => controller.getDocuments(req, res));
documentsRoutes.post('/', (req, res) => controller.createDocument(req, res));
// Add new upload route
documentsRoutes.post('/upload', upload.single('file'), (req, res) =>
  controller.uploadDocument(req, res)
);
documentsRoutes.delete('/:id', (req, res) => controller.archiveDocument(req, res));

documentsRoutes.get('/:id/versions', (req, res) => controller.getDocumentVersions(req, res));
documentsRoutes.post('/:id/versions', (req, res) => controller.addVersion(req, res));
