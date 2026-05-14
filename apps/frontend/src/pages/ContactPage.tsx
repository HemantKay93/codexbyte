import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PageSeo } from '@/components/seo/PageSeo';
import { Send, Phone, Mail, MapPin, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import { useCMS } from '@/features/cms/useCMS';

export function ContactPage() {
  const { data: contactPageCms } = useCMS('contact_page');
  const { data: globalCms } = useCMS('global');
  const { data: homeCms } = useCMS('home');

  // Helper to get the API base URL for lead submission
  const API_BASE_URL =
    (import.meta as any).env?.VITE_API_BASE_URL || 'https://codexbyte.onrender.com/api';

  const contactData = contactPageCms?.details ||
    globalCms?.contact ||
    homeCms?.contact || {
      address: 'Chaltakonda, Routhkhanda, Near Kali Mata Mandir, Joypur, Bankura, West Bengal',
      pincode: '722138',
      phone: '+91 78889 57575',
      email: 'hello@byteevolvr.com',
      workingHours: 'Mon-Sat: 9:00 AM - 7:00 PM',
    };

  const details = contactData;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const response = await fetch(`${baseUrl}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to connect to the server.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <PageSeo
        title="Contact | ByteeVolvr"
        description="Reach ByteeVolvr for AMC, consulting, B2B supply, and support enquiries."
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
          // Get In Touch
        </motion.span>
        <motion.h1
          variants={itemVariants}
          className="mb-6 font-display text-5xl font-bold leading-[0.9] text-white lg:text-7xl"
        >
          Contact
          <span className="block text-[rgba(139,155,184,0.5)]">Us</span>
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="max-w-xl text-lg leading-relaxed text-brand-muted"
        >
          Have a requirement or a question? Send us a message and our technical team will get back
          to you within 24 hours.
        </motion.p>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-8 lg:col-span-4">
            <h2 className="mb-8 font-display text-xl font-semibold text-white">
              Contact Information
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 text-accent mt-1" />
                <div className="text-sm">
                  <p className="text-white font-medium">Visit Us</p>
                  <p className="text-brand-muted">
                    {details.address} {details.pincode ? `- ${details.pincode}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="h-5 w-5 text-accent mt-1" />
                <div className="text-sm">
                  <p className="text-white font-medium">Call Us</p>
                  <p className="text-brand-muted">{details.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="h-5 w-5 text-accent mt-1" />
                <div className="text-sm">
                  <p className="text-white font-medium">Email Us</p>
                  <p className="text-brand-muted">{details.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="h-5 w-5 text-accent mt-1" />
                <div className="text-sm">
                  <p className="text-white font-medium">Working Hours</p>
                  <p className="text-brand-muted">
                    {details.workingHours || 'Mon-Sat: 9:00 AM - 7:00 PM'}
                  </p>
                </div>
              </div>

              {/* Google Maps Embed */}
              <div className="mt-8 overflow-hidden rounded-xl border border-white/5 bg-white/5 h-48 w-full grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <iframe
                  src={
                    details.mapUrl ||
                    `https://www.google.com/maps?q=${encodeURIComponent(details.address)}&output=embed`
                  }
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </motion.div>

          <motion.form
            variants={itemVariants}
            className="glass-panel rounded-2xl p-8 lg:col-span-8"
            onSubmit={handleSubmit}
          >
            <h2 className="mb-6 font-display text-xl font-semibold text-white">
              Send us a Message
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-brand-muted uppercase tracking-wider ml-1">
                  Full Name
                </label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="contact-input w-full"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-brand-muted uppercase tracking-wider ml-1">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="contact-input w-full"
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-brand-muted uppercase tracking-wider ml-1">
                  Phone Number
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="contact-input w-full"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-brand-muted uppercase tracking-wider ml-1">
                  Subject
                </label>
                <input
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="contact-input w-full"
                  placeholder="Requirement details"
                />
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <label className="text-xs font-medium text-brand-muted uppercase tracking-wider ml-1">
                Message
              </label>
              <textarea
                required
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="contact-input min-h-40 w-full resize-none"
                placeholder="Tell us about your requirement..."
              />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
              <button
                disabled={status === 'loading'}
                type="submit"
                className="btn-primary flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold text-white w-full sm:w-auto disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>

              {status === 'success' && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-emerald-400 text-sm flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {message}
                </motion.p>
              )}
              {status === 'error' && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-rose-400 text-sm"
                >
                  {message}
                </motion.p>
              )}
            </div>
          </motion.form>
        </div>
      </motion.section>
    </>
  );
}
