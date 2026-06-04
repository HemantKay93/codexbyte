import { useEffect } from 'react';
import { GrowthBook, GrowthBookProvider } from '@growthbook/growthbook-react';

const growthbook = new GrowthBook({
  apiHost: process.env.VITE_GROWTHBOOK_API_HOST || 'https://cdn.growthbook.io',
  clientKey: process.env.VITE_GROWTHBOOK_CLIENT_KEY || 'development_key',
  enableDevMode: true,
  trackingCallback: (experiment, result) => {
    // TODO: Connect to your analytics provider (e.g. Mixpanel, PostHog, GA)
    console.log('Experiment Viewed', {
      // eslint-disable-line no-console
      experimentId: experiment.key,
      variationId: result.key,
    });
  },
});

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load feature definitions from API
    growthbook.loadFeatures().catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('Failed to load GrowthBook features', err);
    });
  }, []);

  return <GrowthBookProvider growthbook={growthbook}>{children}</GrowthBookProvider>;
}
