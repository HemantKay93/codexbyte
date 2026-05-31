import { motion } from 'framer-motion';

import { PageSeo } from '@/components/seo/PageSeo';
import { useCMS } from '@/features/cms/useCMS';
import { Loader2 } from 'lucide-react';

export default function PrivacyPolicy() {
  const { data: cms, isLoading } = useCMS('privacy');
  const content = cms?.main;

  return (
    <>
      <PageSeo
        title={content?.title || 'Privacy Policy | ByteeVolvr'}
        description="ByteeVolvr Privacy Policy and Data Protection guidelines."
      />
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl px-6 pb-24 pt-40 lg:px-8 min-h-[60vh]"
      >
        <h1 className="font-display text-4xl font-bold text-white mb-8">
          {content?.title || 'Privacy Policy'}
        </h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-stitch-primary animate-spin" />
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-brand-muted space-y-6 whitespace-pre-wrap">
            {content?.lastUpdated && (
              <p className="text-sm text-stitch-outline">Last Updated: {content.lastUpdated}</p>
            )}
            {content?.content ? (
              content.content
            ) : (
              <p>Privacy policy content is currently unavailable. Please check back later.</p>
            )}
          </div>
        )}
      </motion.section>
    </>
  );
}
