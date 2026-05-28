import { motion } from 'framer-motion';

import { PageSeo } from '@/components/seo/PageSeo';
import { useCMS } from '@/features/cms/useCMS';

export default function TermsAndConditions() {
  const { data: cms } = useCMS('terms');
  const content = cms?.main || {
    title: 'Terms & Conditions',
    content:
      'By accessing this website, you agree to be bound by these Terms and Conditions of use.',
  };

  return (
    <>
      <PageSeo
        title="Terms & Conditions | ByteeVolvr"
        description="ByteeVolvr Terms and Conditions of Service."
      />
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl px-6 pb-24 pt-40 lg:px-8"
      >
        <h1 className="font-display text-4xl font-bold text-white mb-8">{content.title}</h1>
        <div className="prose prose-invert max-w-none text-brand-muted whitespace-pre-wrap">
          {content.content}
        </div>
      </motion.section>
    </>
  );
}
