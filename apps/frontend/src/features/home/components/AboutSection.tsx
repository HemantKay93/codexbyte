import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

const stats = [
  { val: '10+', label: 'Years Experience', sub: 'In IT consulting & trading' },
  { val: '500+', label: 'Business Clients', sub: 'Across India' },
  { val: '3000+', label: 'Products Listed', sub: 'In our online store' },
  { val: '99.8%', label: 'AMC SLA Uptime', sub: 'Guaranteed response' },
];

function AnimatedStat({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => (Math.round(v * 10) / 10).toString());

  useEffect(() => {
    if (isInView) {
      animate(count, value, { duration: 1.5, ease: 'easeOut' });
    }
  }, [isInView, count, value]);

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden py-28"
      style={{ background: 'linear-gradient(180deg, #04080F 0%, #070D1A 50%, #04080F 100%)' }}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            // About Us
          </span>
        </div>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="flex flex-col gap-8 lg:col-span-7">
            <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-white lg:text-5xl">
              We do not just fix computers.
              <span className="text-[rgba(139,155,184,0.45)]">
                {' '}
                We architect the technology backbone of your business.
              </span>
            </h2>
            <p className="text-base leading-relaxed text-brand-muted">
              ByteeVolvr Enterprises started as a small repair shop in Mumbai and grew into a
              full-spectrum IT company trusted by businesses across India.
            </p>
            <p className="text-base leading-relaxed text-brand-muted">
              Our strength is versatility: consulting, supply, repair, AMC delivery, and a scalable
              commerce engine for hardware and accessories.
            </p>
            <img
              src="https://img.rocket.new/generatedImages/rocket_gen_img_14598519e-1768103454712.png"
              alt="ByteeVolvr technician working on hardware"
              className="h-[260px] w-full rounded-2xl border border-accent/10 object-cover"
              loading="lazy"
            />
          </div>

          <div className="flex flex-col gap-4 lg:col-span-5" style={{ perspective: '1000px' }}>
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, rotateX: -15, y: 30 }}
                whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ rotateY: 3, rotateX: -3, scale: 1.02 }}
                style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
                className="glass-panel rounded-2xl p-6 cursor-default"
              >
                <div
                  className="mb-1 text-4xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff, #60A5FA)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  <AnimatedStat
                    value={parseFloat(stat.val)}
                    suffix={stat.val.replace(/[0-9.]/g, '')}
                  />
                </div>
                <div className="font-display text-base font-semibold text-white">{stat.label}</div>
                <div className="font-mono text-xs text-brand-subtle">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
