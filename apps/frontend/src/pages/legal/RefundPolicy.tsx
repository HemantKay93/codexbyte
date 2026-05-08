import { motion } from 'framer-motion';
import { PageSeo } from '@/components/seo/PageSeo';

export default function RefundPolicy() {
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
        <h1 className="font-display text-4xl font-bold text-white mb-8">Refund Policy</h1>
        <div className="prose prose-invert max-w-none text-brand-muted space-y-6">
          <p>Last Updated: April 25, 2026</p>
          <p>
            We want you to be satisfied with your purchase. If you are not entirely happy, we're
            here to help.
          </p>
          <h2 className="text-white text-xl font-bold mt-8">1. Returns</h2>
          <p>
            You have 7 calendar days to return an item from the date you received it. To be eligible
            for a return, your item must be unused and in the same condition that you received it.
          </p>
          <h2 className="text-white text-xl font-bold mt-8">2. Refunds</h2>
          <p>
            Once we receive your item, we will inspect it and notify you that we have received your
            returned item. If your return is approved, we will initiate a refund to your original
            method of payment.
          </p>
          <h2 className="text-white text-xl font-bold mt-8">3. Services</h2>
          <p>
            Consulting and repair services are non-refundable once the service has been performed
            and signed off.
          </p>
        </div>
      </motion.section>
    </>
  );
}
