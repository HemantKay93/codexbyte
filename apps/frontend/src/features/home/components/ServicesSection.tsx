import { motion } from 'framer-motion';
import { Server, Wrench, ShieldCheck, Cpu, Wifi, Package, LucideIcon } from 'lucide-react';

import { websiteServices } from '@/content/services';

const SERVICE_ICONS: Record<string, LucideIcon> = {
  consulting: Server,
  repair: Wrench,
  amc: ShieldCheck,
  hardware: Cpu,
  networking: Wifi,
  supply: Package,
};

export function ServicesSection() {
  return (
    <section
      id="services"
      className="relative overflow-hidden py-28"
      style={{ background: '#04080F' }}
    >
      <div
        className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2"
        style={{ background: 'radial-gradient(ellipse, rgba(26,79,214,0.08) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mb-3 block font-mono text-xs uppercase tracking-widest text-accent">
              // What We Do
            </span>
            <h2 className="font-display text-4xl font-bold leading-[0.9] tracking-tight text-white lg:text-6xl">
              <span className="block">Full-Stack</span>
              <span className="block text-[rgba(139,155,184,0.5)]">IT Services</span>
            </h2>
          </div>
          <p className="max-w-xs text-right font-mono text-sm text-brand-muted">
            // CONSULTING // REPAIR // SUPPLY // AMC
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {websiteServices.map((service, index) => {
            const Icon = SERVICE_ICONS[service.id] ?? Server;
            return (
              <motion.article
                key={service.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="card-glow rounded-2xl border border-white/5 bg-brand-bg p-8 cursor-default transition-colors hover:bg-brand-bg2"
              >
                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    background: `${service.accent}15`,
                    border: `1px solid ${service.accent}30`,
                    color: service.accent,
                  }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="mb-3 font-display text-xl font-semibold text-white">
                  {service.title}
                </h3>
                <p className="mb-5 text-sm leading-relaxed text-brand-muted">{service.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-2.5 py-1 font-mono text-[10px]"
                      style={{
                        background: `${service.accent}10`,
                        border: `1px solid ${service.accent}25`,
                        color: service.accent,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
