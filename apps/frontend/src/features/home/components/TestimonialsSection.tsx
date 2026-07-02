import { motion } from 'framer-motion';

const testimonials = [
  {
    quote:
      'ByteeVolvr handles our office IT infrastructure and cut downtime dramatically after signing our AMC.',
    name: 'Rajesh Mehta',
    title: 'Operations Director',
  },
  {
    quote:
      'Pricing is competitive, supply is reliable, and the quality is consistently genuine across bulk orders.',
    name: 'Priya Nair',
    title: 'Procurement Manager',
  },
  {
    quote:
      'Their consulting team gave us a practical roadmap and stayed involved through execution.',
    name: 'Amit Sharma',
    title: 'CEO',
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden py-28" style={{ background: '#070D1A' }}>
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mb-3 block font-mono text-xs uppercase tracking-widest text-accent">
              // Client Feedback
            </span>
            <h2 className="font-display text-4xl font-bold leading-[0.9] tracking-tight text-white lg:text-5xl">
              Trusted by <span className="text-[rgba(139,155,184,0.45)]">businesses</span>
              <br />
              across India
            </h2>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.article
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.12 }}
              whileHover={{ y: -8, boxShadow: '0 24px 60px rgba(26,79,214,0.15)' }}
              className="glass-panel rounded-2xl p-8 relative overflow-hidden cursor-default"
            >
              <span
                className="absolute top-4 right-6 font-display text-8xl text-accent/5 select-none leading-none"
                aria-hidden="true"
              >
                "
              </span>
              <p className="text-sm leading-relaxed text-brand-fg relative z-10">
                “{testimonial.quote}”
              </p>
              <div className="mt-6 border-t border-white/5 pt-6 relative z-10">
                <div className="font-display text-sm font-semibold text-white">
                  {testimonial.name}
                </div>
                <div className="font-mono text-xs text-brand-subtle">{testimonial.title}</div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
