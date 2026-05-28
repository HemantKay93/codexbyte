import { Request, Response } from 'express';

import logger from '../../services/logger.js';
import { whatsappQueue } from '../../jobs/whatsapp.queue.js';
import { CacheService } from '../../services/cacheService.js';
import { getAdminClient } from '../../config/supabase.js';

import { WhatsAppRepository } from './whatsapp.repository.js';
import { WhatsAppService } from './whatsapp.service.js';

const repository = new WhatsAppRepository();

export const getStatus = async (req: Request, res: Response) => {
  try {
    const status = await WhatsAppService.getStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    logger.error('[WhatsAppController] Error getting status:', error);
    res.status(500).json({ success: false, message: 'Failed to get status' });
  }
};

export const getLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const result = await WhatsAppService.getLogs(page, limit);
    // Return entire result under 'data' so apiClient interceptor unwraps correctly
    // Frontend receives: { data: [...], count, page, limit }
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('[WhatsAppController] Error getting logs:', error);
    res.status(500).json({ success: false, message: 'Failed to get logs' });
  }
};

export const reconnect = async (req: Request, res: Response) => {
  try {
    logger.info('[WhatsAppController] Restart requested via API. Dispatching queue command...');
    await whatsappQueue.add('control', { action: 'restart' });
    res.json({ success: true, message: 'Restart command dispatched to background worker.' });
  } catch (error) {
    logger.error('Error restarting WhatsApp:', error);
    res.status(500).json({ success: false, error: 'Failed to restart WhatsApp session' });
  }
};

export const generateQR = async (req: Request, res: Response) => {
  try {
    logger.info('[WhatsAppController] Generate QR requested via API. Dispatching queue command...');
    await whatsappQueue.add('control', { action: 'generate_qr' });
    res.json({ success: true, message: 'Generate QR command dispatched to background worker.' });
  } catch (error) {
    logger.error('Error generating QR:', error);
    res.status(500).json({ success: false, error: 'Failed to generate QR code' });
  }
};

export const enqueueTestMessage = async (req: Request, res: Response) => {
  try {
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ success: false, message: 'Missing to or message' });
    }
    await WhatsAppService.enqueueMessage(to, { content: message, type: 'text' });
    res.json({ success: true, message: 'Message enqueued successfully' });
  } catch (error) {
    logger.error('[WhatsAppController] Error enqueueing message:', error);
    res.status(500).json({ success: false, message: 'Failed to enqueue message' });
  }
};

// --- Task/Queue Management ---

export const getTasks = async (req: Request, res: Response) => {
  try {
    const jobs = await whatsappQueue.getJobs([
      'waiting',
      'active',
      'completed',
      'failed',
      'delayed',
    ]);
    // Filter to only return necessary data to avoid giant payloads
    const formattedJobs = jobs.map((j) => ({
      id: j.id,
      name: j.name,
      data: j.data,
      opts: j.opts,
      progress: j.progress,
      delay: j.delay,
      timestamp: j.timestamp,
      finishedOn: j.finishedOn,
      processedOn: j.processedOn,
      returnvalue: j.returnvalue,
      failedReason: j.failedReason,
      stacktrace: j.stacktrace,
      attemptsMade: j.attemptsMade,
      isFailed: !!j.failedReason,
    }));

    // Determine status for UI
    const result = await Promise.all(
      jobs.map(async (j) => {
        const state = await j.getState();
        return {
          id: j.id,
          name: j.name,
          data: j.data,
          state,
          failedReason: j.failedReason,
          timestamp: j.timestamp,
          attemptsMade: j.attemptsMade,
        };
      })
    );
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('[WhatsAppController] Error getting tasks:', error);
    res.status(500).json({ success: false, message: 'Failed to get tasks' });
  }
};

export const retryTask = async (req: Request, res: Response) => {
  try {
    const job = await whatsappQueue.getJob(req.params.id as string);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    await job.retry();
    res.json({ success: true, message: 'Job retried' });
  } catch (error) {
    logger.error('[WhatsAppController] Error retrying task:', error);
    res.status(500).json({ success: false, message: 'Failed to retry task' });
  }
};

export const bulkRetryFailed = async (req: Request, res: Response) => {
  try {
    const failedJobs = await whatsappQueue.getFailed();
    let retriedCount = 0;
    for (const job of failedJobs) {
      await job.retry();
      retriedCount++;
    }
    res.json({ success: true, message: `Retried ${retriedCount} failed jobs` });
  } catch (error) {
    logger.error('[WhatsAppController] Error bulk retrying failed tasks:', error);
    res.status(500).json({ success: false, message: 'Failed to bulk retry tasks' });
  }
};

export const cancelTask = async (req: Request, res: Response) => {
  try {
    const job = await whatsappQueue.getJob(req.params.id as string);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    await job.remove();
    res.json({ success: true, message: 'Job removed' });
  } catch (error) {
    logger.error('[WhatsAppController] Error removing task:', error);
    res.status(500).json({ success: false, message: 'Failed to remove task' });
  }
};

export const pauseQueue = async (req: Request, res: Response) => {
  try {
    await whatsappQueue.pause();
    res.json({ success: true, message: 'Queue paused' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to pause queue' });
  }
};

export const resumeQueue = async (req: Request, res: Response) => {
  try {
    await whatsappQueue.resume();
    res.json({ success: true, message: 'Queue resumed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to resume queue' });
  }
};

// --- Template Management ---

export const getTemplates = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'whatsapp:templates';
    const cached = await CacheService.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached });

    const templates = await repository.getTemplates();
    await CacheService.set(cacheKey, templates, 3600); // 1 hour cache
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get templates' });
  }
};

export const createTemplate = async (req: Request, res: Response) => {
  try {
    const template = await repository.createTemplate(req.body);
    await CacheService.del('whatsapp:templates');
    res.json({ success: true, data: template });
  } catch (error: any) {
    logger.error('[WhatsAppController] Failed to create template:', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to create template',
      details: error?.details,
    });
  }
};

export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const template = await repository.updateTemplate(req.params.id as string, req.body);
    await CacheService.del('whatsapp:templates');
    res.json({ success: true, data: template });
  } catch (error: any) {
    logger.error('[WhatsAppController] Failed to update template:', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to update template',
      details: error?.details,
    });
  }
};

export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    await repository.deleteTemplate(req.params.id as string);
    await CacheService.del('whatsapp:templates');
    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete template' });
  }
};

export const bulkEnqueueMessages = async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'messages must be an array' });
    }

    let enqueued = 0;
    for (const msg of messages) {
      if (msg.to && msg.message) {
        await WhatsAppService.enqueueMessage(msg.to, { content: msg.message, type: 'text' });
        enqueued++;
      }
    }

    res.json({ success: true, message: `Successfully queued ${enqueued} messages.` });
  } catch (error) {
    logger.error('[WhatsAppController] Bulk enqueue error:', error);
    res.status(500).json({ success: false, message: 'Failed to enqueue messages' });
  }
};

// --- Provider Settings ---

export const getProviders = async (req: Request, res: Response) => {
  try {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('provider_configs')
      .select('*')
      .order('priority', { ascending: true });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    logger.error('[WhatsAppController] Error getting providers:', error);
    res.status(500).json({ success: false, message: 'Failed to get providers' });
  }
};

export const updateProvider = async (req: Request, res: Response) => {
  try {
    const { provider_name, is_enabled, priority, config } = req.body;
    if (!provider_name)
      return res.status(400).json({ success: false, message: 'provider_name is required' });

    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('provider_configs')
      .upsert(
        {
          provider_name,
          is_enabled,
          priority,
          config,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'provider_name' }
      )
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    logger.error('[WhatsAppController] Error updating provider:', error);
    res.status(500).json({ success: false, message: 'Failed to update provider settings' });
  }
};
