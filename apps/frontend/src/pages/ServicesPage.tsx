import { motion } from 'framer-motion';
import { PageSeo } from '@/components/seo/PageSeo';
import { websiteServices } from '@/content/services';
import { ArrowUpRight } from 'lucide-react';

export function ServicesPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
  };

  return (
    <>
      <PageSeo
        title="Our Services | ByteeVolvr"
        description="Explore IT consulting, repair, AMC, technology trading, and B2B services from ByteeVolvr."
      />
      <motion.section 
        className="mx-auto max-w-7xl px-6 pb-24 pt-40 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.span variants={itemVariants} className="mb-4 block font-mono text-xs uppercase tracking-widest text-accent">// What We Do</motion.span>
        <motion.h1 variants={itemVariants} className="mb-6 font-display text-5xl font-bold leading-[0.9] text-white lg:text-7xl">
          Full-Spectrum
          <span className="block text-[rgba(139,155,184,0.5)]">IT Services</span>
        </motion.h1>
        <motion.p variants={itemVariants} className="max-w-2xl text-lg leading-relaxed text-brand-muted">
          We provide a comprehensive range of technology services designed to keep your business running smoothly, from high-level consulting to ground-level hardware support.
        </motion.p>

        <motion.div 
          variants={containerVariants}
          className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {websiteServices.map((service) => (
            <motion.article 
              key={service.id} 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="glass-panel group relative rounded-2xl p-8 transition-all hover:border-accent/30"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="font-display text-xl font-semibold text-white group-hover:text-accent transition-colors">
                  {service.title}
                </h2>
                <ArrowUpRight className="h-5 w-5 text-brand-subtle group-hover:text-accent transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
              <p className="mb-6 text-sm leading-relaxed text-brand-muted line-clamp-3">
                {service.desc}
              </p>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-accent/20 bg-primary/10 px-2.5 py-1 font-mono text-[10px] text-accent">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </motion.div>
      </motion.section>
    </>
  );
}
