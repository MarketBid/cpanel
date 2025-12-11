import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, ShieldCheck, Timer, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import PublicLayout from '../components/PublicLayout.tsx';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import AnimatedGradient from '../components/ui/AnimatedGradient';
import FloatingCard from '../components/ui/FloatingCard';

const contactChannels = [
  {
    icon: Phone,
    label: 'Call sales',
    value: '+233 54 315 5912',
    desc: 'Mon–Sat, 8am–7pm GMT',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'r.quaicoe@clarsix.com',
    desc: 'We reply in one business day',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: MapPin,
    label: 'Office',
    value: 'Remote-first · Accra · San Francisco',
    desc: 'Available for on-site diligence',
    color: 'from-purple-500 to-pink-600',
  },
];

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    useCase: '',
    industry: '',
    timeline: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <PublicLayout>
      <section className="relative overflow-hidden bg-[var(--bg-primary)] py-16 sm:py-20 lg:py-24">
        {/* Subtle background animation */}
        <div className="absolute inset-0 -z-10">
          <AnimatedGradient className="opacity-30" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-start relative z-10">
          {/* Left Column: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-light)] rounded-full"
              >
                <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
                <span className="text-sm font-medium text-[var(--color-primary)]">Get in touch</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] leading-[1.05]">
                Let's design escrow around{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  your flow
                </span>
              </h1>
              
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                Tell us about your use case and we'll share the fastest path to launch—whether it's milestone-heavy for every project, platform payouts, or high-value asset deals.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="grid gap-4">
              {contactChannels.map((item, index) => {
                const Icon = item.icon;
                return (
                  <FloatingCard key={item.label} delay={index * 0.1}>
                    <motion.a
                      href={item.icon === Mail ? `mailto:${item.value}` : item.icon === Phone ? `tel:${item.value}` : undefined}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-start gap-4 p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[var(--color-primary)]/30 hover:shadow-lg transition-all group cursor-pointer"
                    >
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-[var(--text-secondary)] font-semibold mb-1">{item.label}</div>
                        <p className="font-bold text-[var(--text-primary)] mb-1">{item.value}</p>
                        <p className="text-sm text-[var(--text-tertiary)]">{item.desc}</p>
                      </div>
                    </motion.a>
                  </FloatingCard>
                );
              })}
            </div>

            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-default)]"
            >
              <ShieldCheck className="h-5 w-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                  Enterprise-grade security
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  We run identity and compliance checks for every request. Your data is encrypted and never shared.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="rounded-3xl bg-[var(--bg-card)] shadow-2xl border border-[var(--border-default)] p-8 relative overflow-hidden">
              {/* Success State */}
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 mb-6"
                  >
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Message sent!</h3>
                  <p className="text-[var(--text-secondary)] mb-6">
                    We've received your message and will get back to you within one business day.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Send another message
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Send us a message</h3>
                    <p className="text-sm text-[var(--text-secondary)]">Fill out the form and we'll be in touch soon</p>
                  </div>

                  <motion.div
                    animate={{
                      scale: focusedField === 'name' ? 1.02 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Input
                      label="Full name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Grace Kwam"
                      className="transition-all duration-200"
                    />
                  </motion.div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <motion.div
                      animate={{
                        scale: focusedField === 'email' ? 1.02 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Input
                        label="Work email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="grace@company.com"
                      />
                    </motion.div>
                    <motion.div
                      animate={{
                        scale: focusedField === 'company' ? 1.02 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Input
                        label="Company"
                        name="company"
                        type="text"
                        value={formData.company}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('company')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Clarsix"
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    animate={{
                      scale: focusedField === 'useCase' ? 1.02 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                      Use case <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="useCase"
                      required
                      value={formData.useCase}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('useCase')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--text-primary)] min-h-[120px] transition-all duration-200"
                      placeholder="Tell us about your escrow flow, timeline, and goals..."
                    />
                  </motion.div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <motion.div
                      animate={{
                        scale: focusedField === 'industry' ? 1.02 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Input
                        label="Industry"
                        name="industry"
                        type="text"
                        value={formData.industry}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('industry')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Fintech, construction, etc."
                      />
                    </motion.div>
                    <motion.div
                      animate={{
                        scale: focusedField === 'timeline' ? 1.02 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Input
                        label="Timeline"
                        name="timeline"
                        type="text"
                        value={formData.timeline}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('timeline')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="e.g., Go-live in 4 weeks"
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      variant="primary"
                      loading={isSubmitting}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-[0_20px_50px_rgba(16,185,129,0.35)] border-0"
                      rightIcon={!isSubmitting ? <Send className="h-4 w-4" /> : undefined}
                    >
                      {isSubmitting ? 'Sending...' : 'Send message'}
                    </Button>
                  </motion.div>

                  <p className="text-xs text-[var(--text-secondary)] text-center flex items-center justify-center gap-2">
                    <Timer className="h-3.5 w-3.5" /> 
                    We reply within one business day
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Contact;
