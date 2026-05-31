import { Router } from 'express';

import { authenticate, requireAdmin } from '../../middlewares/auth.js';

import {
  getStatus,
  getLogs,
  reconnect,
  enqueueTestMessage,
  getTasks,
  retryTask,
  cancelTask,
  pauseQueue,
  resumeQueue,
  bulkRetryFailed,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  generateQR,
  bulkEnqueueMessages,
  getProviders,
  updateProvider,
} from './whatsapp.controller.js';
import { webhookHealth, verifyWebhook, handleWebhookEvent } from './whatsapp.webhook.controller.js';

const router = Router();

// Public Webhook Routes (Meta API & Evolution API)
router.get('/webhook', verifyWebhook);
router.post(['/webhook', '/webhook/*'], handleWebhookEvent);

// Protect all whatsapp dashboard routes, admin only
router.use(authenticate, requireAdmin);

router.get('/webhook/health', webhookHealth);

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

// Provider Config Routes
router.get('/providers', getProviders);
router.post('/providers', updateProvider);

export default router;
