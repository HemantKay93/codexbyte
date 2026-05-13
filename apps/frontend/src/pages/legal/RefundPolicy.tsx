import { motion } from 'framer-motion';
import { PageSeo } from '@/components/seo/PageSeo';
import { useCMS } from '@/features/cms/useCMS';

export default function RefundPolicy() {
  const { data: cms } = useCMS('refund');
  const content = cms?.main || {
    title: 'Refund Policy',
    content:
      "We want you to be satisfied with your purchase. If you are not entirely happy, we're here to help.",
  };

  return (
    <>
      <PageSeo
        title="Refund Policy | ByteeVolvr"
        description="ByteeVolvr Refund and Return Policy."
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
