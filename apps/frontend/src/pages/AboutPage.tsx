import { motion } from 'framer-motion';
import { PageSeo } from '@/components/seo/PageSeo';
import { Target, Users, Shield, Zap } from 'lucide-react';
import { useCMS } from '@/features/cms/useCMS';

export function AboutPage() {
  const { data: cms } = useCMS('about');
  const content = cms?.main || {
    title: 'Empowering Business with Intelligent Technology Solutions.',
    content: `Founded on the principles of trust and technical excellence, ByteeVolvr Enterprises has evolved from a specialized repair service into a comprehensive IT partner for businesses across India.\n\nWe understand that technology is the backbone of modern enterprise. Our mission is to ensure your infrastructure is robust, your supply chain is seamless, and your operations are never interrupted.`,
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <PageSeo
        title="About Us | ByteeVolvr"
        description="Learn how ByteeVolvr grew from repair and supply into a full-spectrum IT services and commerce business."
      />
      <motion.section
        className="mx-auto max-w-7xl px-6 pb-24 pt-40 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.span
          variants={itemVariants}
          className="mb-4 block font-mono text-xs uppercase tracking-widest text-accent"
        >
          // Our Story
        </motion.span>
        <motion.h1
          variants={itemVariants}
          className="mb-10 max-w-4xl font-display text-5xl font-bold leading-tight text-white lg:text-6xl"
        >
          {content.title}
        </motion.h1>

        <div className="grid gap-12 lg:grid-cols-2">
          <motion.div variants={itemVariants} className="space-y-6">
            {content.content.split('\n\n').map((para: string, i: number) => (
              <p key={i} className="text-lg leading-relaxed text-brand-muted">
                {para}
              </p>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
            <div className="glass-panel rounded-2xl p-6">
              <Target className="h-6 w-6 text-accent mb-4" />
              <h3 className="text-white font-bold mb-2">Our Mission</h3>
              <p className="text-xs text-brand-muted">
                To provide scalable IT solutions that drive growth.
              </p>
            </div>
            <div className="glass-panel rounded-2xl p-6">
              <Users className="h-6 w-6 text-accent mb-4" />
              <h3 className="text-white font-bold mb-2">Expert Team</h3>
              <p className="text-xs text-brand-muted">
                Certified professionals with years of experience.
              </p>
            </div>
            <div className="glass-panel rounded-2xl p-6">
              <Shield className="h-6 w-6 text-accent mb-4" />
              <h3 className="text-white font-bold mb-2">Total Security</h3>
              <p className="text-xs text-brand-muted">
                Protecting your data and infrastructure 24/7.
              </p>
            </div>
            <div className="glass-panel rounded-2xl p-6">
              <Zap className="h-6 w-6 text-accent mb-4" />
              <h3 className="text-white font-bold mb-2">Rapid Response</h3>
              <p className="text-xs text-brand-muted">Minimized downtime with quick turnaround.</p>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </>
  );
}
