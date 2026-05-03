import { motion } from 'framer-motion';
import { PageSeo } from '@/components/seo/PageSeo';

export default function TermsAndConditions() {
  return (
    <>
      <PageSeo title="Terms & Conditions | ByteeVolvr" description="ByteeVolvr Terms and Conditions of Service." />
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl px-6 pb-24 pt-40 lg:px-8"
      >
        <h1 className="font-display text-4xl font-bold text-white mb-8">Terms & Conditions</h1>
        <div className="prose prose-invert max-w-none text-brand-muted space-y-6">
          <p>Last Updated: April 25, 2026</p>
          <p>
            By accessing this website, you agree to be bound by these Terms and Conditions of use.
          </p>
          <h2 className="text-white text-xl font-bold mt-8">1. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials on ByteeVolvr's website for personal, non-commercial transitory viewing only.
          </p>
          <h2 className="text-white text-xl font-bold mt-8">2. Disclaimer</h2>
          <p>
            The materials on ByteeVolvr's website are provided on an 'as is' basis. ByteeVolvr makes no warranties, expressed or implied.
          </p>
          <h2 className="text-white text-xl font-bold mt-8">3. Limitations</h2>
          <p>
            In no event shall ByteeVolvr or its suppliers be liable for any damages arising out of the use or inability to use the materials on ByteeVolvr's website.
          </p>
        </div>
      </motion.section>
    </>
  );
}
