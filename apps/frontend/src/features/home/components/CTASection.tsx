import { Link } from 'react-router-dom';

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
          <div className="flex min-h-[320px] flex-col justify-between bg-[#0A1628] p-10 lg:p-14">
            <div>
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
              className="btn-primary inline-flex w-fit items-center rounded-xl px-8 py-4 text-base font-semibold text-white"
            >
              Visit Our Store
            </Link>
          </div>

          <div className="flex min-h-[320px] flex-col bg-[#070D1A] p-10 lg:p-14">
            <h3 className="mb-3 font-display text-2xl font-bold text-white">Talk to Our Team</h3>
            <p className="mb-6 text-sm leading-relaxed text-brand-muted">
              Use the business website for high-intent consulting, AMC, and B2B lead capture.
            </p>
            <a
              href="/contact"
              className="btn-ghost mt-auto inline-flex w-fit items-center rounded-lg px-6 py-3.5 text-sm font-semibold text-white"
            >
              Send Enquiry
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
