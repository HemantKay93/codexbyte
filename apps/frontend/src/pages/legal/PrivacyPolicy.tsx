import { motion } from 'framer-motion';
import { PageSeo } from '@/components/seo/PageSeo';

export default function PrivacyPolicy() {
  return (
    <>
      <PageSeo
        title="Privacy Policy | ByteeVolvr"
        description="ByteeVolvr Privacy Policy and Data Protection guidelines."
      />
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl px-6 pb-24 pt-40 lg:px-8"
      >
        <h1 className="font-display text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none text-brand-muted space-y-6">
          <p>Last Updated: April 25, 2026</p>
          <p>
            At ByteeVolvr Enterprises, we prioritize your privacy. This policy outlines how we
            collect, use, and protect your personal information when you use our website and
            services.
          </p>
          <h2 className="text-white text-xl font-bold mt-8">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us (name, email, phone number) when you
            contact us for services or make a purchase in our shop.
          </p>
          <h2 className="text-white text-xl font-bold mt-8">2. How We Use Your Information</h2>
          <p>
            We use your data to provide services, process orders, and communicate with you about
            your technical requirements.
          </p>
          <h2 className="text-white text-xl font-bold mt-8">3. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data from unauthorized
            access or disclosure.
          </p>
        </div>
      </motion.section>
    </>
  );
}
