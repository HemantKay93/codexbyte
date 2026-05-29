import { Request, Response, NextFunction } from 'express';

import { getAdminClient } from '../config/supabase.js';
import logger from '../services/logger.js';

export const idempotencyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const idempotencyKey = req.headers['idempotency-key'] as string;

  if (!idempotencyKey) {
    // If no key is provided, we just proceed (or we could enforce it).
    // For now, we make it optional but highly recommended.
    return next();
  }

  const admin = await getAdminClient();
  const path = req.originalUrl;
  const method = req.method;

  try {
    // 1. Check if key exists
    const { data: existingKey, error: fetchError } = await admin
      .from('idempotency_keys')
      .select('*')
      .eq('key', idempotencyKey)
      .maybeSingle();

    if (fetchError) {
      logger.error('[Idempotency] Error fetching key:', fetchError);
      return next(); // Fail open if DB issue
    }

    if (existingKey) {
      if (existingKey.status === 'processing') {
        return res.status(409).json({
          success: false,
          message: 'A request with this idempotency key is currently processing.',
        });
      }

      // If completed, return cached response
      logger.info(`[Idempotency] Returning cached response for key: ${idempotencyKey}`);
      return res.status(existingKey.response_code || 200).json(existingKey.response_body);
    }

    // 2. Lock the key (insert as processing)
    const { error: insertError } = await admin.from('idempotency_keys').insert({
      key: idempotencyKey,
      path,
      method,
      status: 'processing',
      request_body: req.body,
    });

    if (insertError) {
      // Possible race condition: another request just inserted it
      if (insertError.code === '23505') {
        // Unique violation
        return res.status(409).json({
          success: false,
          message: 'A request with this idempotency key is currently processing.',
        });
      }
      logger.error('[Idempotency] Error inserting key:', insertError);
      return next(); // Fail open
    }

    // 3. Intercept response to save it
    const originalJson = res.json;
    res.json = function (body) {
      // Restore original json to avoid double-calling issues
      res.json = originalJson;

      // Update the DB asynchronously so it doesn't block the response
      admin
        .from('idempotency_keys')
        .update({
          status: 'completed',
          response_code: res.statusCode,
          response_body: body,
        })
        .eq('key', idempotencyKey)
        .then(({ error }: any) => {
          // eslint-disable-line @typescript-eslint/no-explicit-any
          // eslint-disable-line @typescript-eslint/no-explicit-any
          if (error) logger.error('[Idempotency] Failed to update key status:', error);
        });

      return originalJson.call(this, body);
    };

    next();
  } catch (error) {
    logger.error('[Idempotency] Middleware error:', error);
    next();
  }
};
