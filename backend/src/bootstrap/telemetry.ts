import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import logger from '../services/logger.js';
import { env } from '../config/env.js';

export function bootstrapTelemetry() {
  logger.info('[Bootstrap] Initializing basic telemetry and correlation tracking...');
  // Initialize Sentry
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [nodeProfilingIntegration()],
      // Performance Monitoring
      tracesSampleRate: 1.0, //  Capture 100% of the transactions
      // Set sampling rate for profiling - this is relative to tracesSampleRate
      profilesSampleRate: 1.0,
      environment: env.NODE_ENV,
    });
    logger.info('[Telemetry] Sentry initialized.');
  } else {
    logger.warn('[Telemetry] SENTRY_DSN not found. Skipping Sentry initialization.');
  }

  if (env.ENABLE_OPENTELEMETRY === 'true') {
    logger.info('[Telemetry] OpenTelemetry tracing is enabled.');
    // TODO: Initialize OTel SDK (e.g. Jaeger/Zipkin exporter)
  }
}
