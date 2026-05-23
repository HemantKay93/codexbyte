import { Router } from 'express';
import { 
  getStatus, getLogs, reconnect, enqueueTestMessage,
  getTasks, retryTask, cancelTask, pauseQueue, resumeQueue, bulkRetryFailed,
  getTemplates, createTemplate, updateTemplate, deleteTemplate, generateQR,
  bulkEnqueueMessages
} from './whatsapp.controller.js';
import { authenticate, requireAdmin } from '../../middlewares/auth.js';

const router = Router();

// Protect all whatsapp routes, admin only
router.use(authenticate, requireAdmin);

router.get('/status', getStatus);
router.get('/logs', getLogs);
router.post('/reconnect', reconnect);
router.post('/test-message', enqueueTestMessage);
router.post('/bulk-campaign', bulkEnqueueMessages);
router.post('/generate-qr', generateQR);

// Queue/Task Routes
router.get('/tasks', getTasks);
router.post('/tasks/retry-failed', bulkRetryFailed);
router.post('/tasks/:id/retry', retryTask);
router.delete('/tasks/:id', cancelTask);
router.post('/queue/pause', pauseQueue);
router.post('/queue/resume', resumeQueue);

// Template Routes
router.get('/templates', getTemplates);
router.post('/templates', createTemplate);
router.put('/templates/:id', updateTemplate);
router.delete('/templates/:id', deleteTemplate);

export default router;
