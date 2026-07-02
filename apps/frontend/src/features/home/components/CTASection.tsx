import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-28" style={{ background: '#04080F' }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-20 text-center">
          <span className="mb-4 block font-mono text-xs uppercase tracking-widest text-accent">
            // Get Started
          </span>
          <h2 className="mb-6 font-display text-[clamp(2.5rem,7vw,6rem)] font-bold leading-[0.85] tracking-tight text-white">
            Ready to upgrade
            <br />
            <span className="text-[rgba(139,155,184,0.4)]">your IT infrastructure?</span>
          </h2>
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-brand-muted">
            Whether you need a one-time repair, an AMC contract, or a full IT transformation
            partner, the business site should guide the lead and the shop should close the sale.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-[20px] bg-white/5 lg:grid-cols-2">
          <motion.div
            whileHover={{ background: 'linear-gradient(135deg, #0D1E42 0%, #0A1628 100%)' }}
            transition={{ duration: 0.4 }}
            className="flex min-h-[320px] flex-col justify-between bg-[#0A1628] p-10 lg:p-14 relative overflow-hidden group"
          >
            <motion.div
              className="absolute -bottom-20 -right-20 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none"
              initial={{ scale: 0.5, opacity: 0 }}
              whileHover={{ scale: 1.5, opacity: 1 }}
              transition={{ duration: 0.6 }}
            />
            <div className="relative z-10">
              <h3 className="mb-3 font-display text-2xl font-bold text-white">
                Shop Our Online Store
              </h3>
              <p className="mb-8 text-sm leading-relaxed text-brand-muted">
                Browse IT hardware, peripherals, and accessories in the dedicated ecommerce
                experience.
              </p>
            </div>
            <Link
              to="/shop"
              className="btn-primary relative z-10 inline-flex w-fit items-center rounded-xl px-8 py-4 text-base font-semibold text-white"
            >
              Visit Our Store
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ background: 'linear-gradient(135deg, #0D1E42 0%, #0A1628 100%)' }}
            transition={{ duration: 0.4 }}
            className="flex min-h-[320px] flex-col bg-[#070D1A] p-10 lg:p-14 relative overflow-hidden group"
          >
            <motion.div
              className="absolute -bottom-20 -left-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"
              initial={{ scale: 0.5, opacity: 0 }}
              whileHover={{ scale: 1.5, opacity: 1 }}
              transition={{ duration: 0.6 }}
            />
            <div className="relative z-10">
              <h3 className="mb-3 font-display text-2xl font-bold text-white">Talk to Our Team</h3>
              <p className="mb-6 text-sm leading-relaxed text-brand-muted">
                Use the business website for high-intent consulting, AMC, and B2B lead capture.
              </p>
            </div>
            <a
              href="/contact"
              className="btn-ghost relative z-10 mt-auto inline-flex w-fit items-center rounded-lg px-6 py-3.5 text-sm font-semibold text-white"
            >
              Send Enquiry
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
