import { Request, Response, NextFunction } from 'express';
import { GrowthBook } from '@growthbook/growthbook';

// Initialize a generic GrowthBook instance for the backend
const growthbook = new GrowthBook({
  apiHost: process.env.GROWTHBOOK_API_HOST || 'https://cdn.growthbook.io',
  clientKey: process.env.GROWTHBOOK_CLIENT_KEY || 'development_key',
});

// Load features initially and periodically
growthbook.loadFeatures({ autoRefresh: true }).catch((err) => {
  console.warn('[GrowthBook] Failed to load features on startup:', err);
});

export const featureFlagMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Create a request-specific GrowthBook instance
  const gb = new GrowthBook({
    apiHost: process.env.GROWTHBOOK_API_HOST || 'https://cdn.growthbook.io',
    clientKey: process.env.GROWTHBOOK_CLIENT_KEY || 'development_key',
    // We reuse the features loaded in the global instance
    features: growthbook.getFeatures(),
    attributes: {
      id: (req as any).user?.id || 'anonymous',
      // eslint-disable-line @typescript-eslint/no-explicit-any
      // eslint-disable-line @typescript-eslint/no-explicit-any
      userAgent: req.headers['user-agent'],
      url: req.originalUrl,
    },
  });

  // Attach to request for downstream use
  // eslint-disable-line @typescript-eslint/no-explicit-any
  (req as any).growthbook = gb;
  // eslint-disable-line @typescript-eslint/no-explicit-any

  next();
};

// Helper for route guards
export const requireFeature = (featureKey: string) => {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  return (req: Request, res: Response, next: NextFunction) => {
    const gb = (req as any).growthbook as GrowthBook;
    // eslint-disable-line @typescript-eslint/no-explicit-any

    if (!gb || !gb.isOn(featureKey)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Feature '${featureKey}' is not enabled.`,
      });
    }

    next();
  };
};
