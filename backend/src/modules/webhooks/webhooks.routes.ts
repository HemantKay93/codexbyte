import { Router } from 'express';
import {
  handleResendWebhook,
  handleBrevoWebhook,
  handleMetaWhatsAppWebhook,
} from './webhooks.controller.js';

const router = Router();

router.post('/resend', handleResendWebhook);
router.post('/brevo', handleBrevoWebhook);

// Meta requires GET for verification and POST for events
router.get('/meta-whatsapp', handleMetaWhatsAppWebhook);
router.post('/meta-whatsapp', handleMetaWhatsAppWebhook);

export default router;
