import React from 'react';
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Globe,
  Globe2,
  Link2,
  MessageSquare,
  Scale,
  Shield,
  Target,
  Truck,
  User,
  UserCheck,
  Zap,
  Layers,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout.tsx';
import Button from '../components/ui/Button';
import AppShowcase from '../components/AppShowcase';
import AnimatedGradient from '../components/ui/AnimatedGradient';
import ScrollToTopButton from '../components/ScrollToTopButton';



const Solutions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      {/* Hero Section with Animated Background - Enhanced for light mode */}
      <section className="relative overflow-hidden min-h-[60vh] flex items-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 -mt-28 pt-28">
        <AnimatedGradient className="absolute inset-0 -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-white/10 backdrop-blur-md rounded-full border border-emerald-200 dark:border-white/20"
            >
              <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              <span className="text-sm font-medium text-emerald-900 dark:text-white">Solutions</span>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.2,
                  },
                },
              }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] text-balance text-slate-900 dark:text-white"
            >
              {/* Masked Text Reveal Effect */}
              <div className="overflow-hidden inline-block align-bottom">
                <motion.span
                  variants={{
                    hidden: { y: "100%" },
                    visible: { y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
                  }}
                  className="inline-block"
                >
                  Built on Trust.
                </motion.span>
              </div>
              <br className="hidden sm:block" />
              <div className="overflow-hidden inline-block align-bottom">
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-300 dark:via-teal-300 dark:to-cyan-300 bg-clip-text text-transparent inline-block">
                  <motion.span
                    variants={{
                      hidden: { y: "100%" },
                      visible: { y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
                    }}
                    className="inline-block"
                  >
                    Powered by Security.
                  </motion.span>
                </span>
              </div>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg text-slate-600 dark:text-white/80 leading-relaxed"
            >
              Bank-level encryption and security protocols protect every transaction from start to finish. With our AI-powered dispute resolution and internal chat system, you can transact with complete confidence.
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-[0_20px_50px_rgba(16,185,129,0.35)] border-0"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  onClick={() => navigate('/contact')}
                >
                  Talk with us
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-slate-100 dark:bg-white/10 backdrop-blur-md !text-slate-900 dark:!text-white border-slate-300 dark:border-white/30 hover:bg-slate-200 dark:hover:bg-white/20"
                  onClick={() => navigate('/register')}
                >
                  Start free trial
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who Uses Clarsix Section */}
      <section className="bg-[var(--bg-primary)] py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mb-4">
              Who Uses Clarsix?
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Trusted by diverse markets for secure, transparent transactions.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Freelancers & Clients',
                desc: 'Project payments held until work is approved.',
                icon: User
              },
              {
                title: 'Online Marketplace Sellers',
                desc: 'High-value items sold with confidence.',
                icon: Globe2
              },
              {
                title: 'Service Providers',
                desc: 'Payment guaranteed for completed services.',
                icon: Briefcase
              },
              {
                title: 'International Traders',
                desc: 'Cross-border transactions made simple and safe.',
                icon: Globe
              },
              {
                title: 'Vehicle & Equipment Sales',
                desc: 'Big-ticket purchases protected.',
                icon: Truck
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] hover:shadow-lg transition-shadow"
                >
                  <div className="h-12 w-12 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Commitment Section */}
      <section className="bg-[var(--bg-secondary)] py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)] mb-3">Our Commitment</p>
                <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mb-4">
                  Built on Trust, Powered by Security
                </h2>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                  We are dedicated to providing a safe, transparent, and fair transaction environment for everyone.
                </p>
              </div>

              <div className="grid gap-6">
                {[
                  {
                    title: 'Secure Transactions',
                    desc: 'Bank-level encryption and security protocols protect every transaction from start to finish.',
                    icon: Shield,
                    color: 'from-emerald-500 to-teal-600',
                  },
                  {
                    title: 'Transparent Process',
                    desc: 'Track status in real-time. Our built-in chat system lets buyers and sellers communicate directly, exchange images, and create a clear record.',
                    icon: MessageSquare,
                    color: 'from-blue-500 to-indigo-600',
                  },
                  {
                    title: 'Fair Resolution',
                    desc: 'AI-powered support system analyzes chat history and evidence to provide fast, fair resolutions with minimal human intervention.',
                    icon: Scale,
                    color: 'from-purple-500 to-pink-600',
                  },
                  {
                    title: 'Fast Processing',
                    desc: 'Quick verification and payment release so your business keeps moving.',
                    icon: Zap,
                    color: 'from-orange-500 to-red-600',
                  },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[var(--color-primary)]/30 transition-all"
                    >
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">{item.title}</h3>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Right: Visual/Image Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-full min-h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]" />
              <div className="text-center p-8">
                <Shield className="h-24 w-24 text-[var(--color-primary)] mx-auto mb-6 opacity-80" />
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Trust Vault Technology</h3>
                <p className="text-[var(--text-secondary)]">Securing your digital transactions</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Detailed Contract Types & Protection */}
      <section className="bg-[var(--bg-primary)] py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)] mb-3">Contract Types</p>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mb-4">
              Choose the right contract type for your transaction
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Whether you need a simple time-based completion or complex milestone-based payments, we've got you covered
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Time-Based Contract Details */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-8 space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)]">Time-Based Completion</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Perfect for fixed-term projects</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">How it works:</h4>
                  <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                      <span>Set a completion date and time for the service or delivery</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                      <span>Configure auto-completion buffer (default: 24 hours)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                      <span>Funds are automatically released if no dispute within the buffer period</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                      <span>Payment sender can dispute before auto-release</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-[var(--border-default)]">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">Best for:</h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    One-time services, fixed-term projects, deliveries with clear deadlines, simple transactions
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Milestone-Based Contract Details */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-8 space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Target className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)]">Milestone-Based Completion</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Ideal for phased projects</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">How it works:</h4>
                  <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                      <span>Break work into multiple milestones with percentage-based payouts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                      <span>Set due dates and completion conditions for each milestone</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                      <span>Funds are released incrementally as milestones are completed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                      <span>Total milestone percentages must equal 100%</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-[var(--border-default)]">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">Best for:</h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Long-term projects, software development, construction, multi-phase deliveries, complex services
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Protection Policies Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-8 space-y-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">Refund & Protection Policies</h3>
                <p className="text-sm text-[var(--text-secondary)]">Comprehensive protection for both parties</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-[var(--text-primary)]">Refund Policy Options:</h4>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-default)]">
                    <h5 className="font-semibold text-[var(--text-primary)] mb-1">Full Refund Protection</h5>
                    <p className="text-sm text-[var(--text-secondary)]">100% refundable if service conditions aren't met</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-default)]">
                    <h5 className="font-semibold text-[var(--text-primary)] mb-1">Conditional Refund</h5>
                    <p className="text-sm text-[var(--text-secondary)]">Refund based on specific conditions (service not started, quality issues, delays, etc.)</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-default)]">
                    <h5 className="font-semibold text-[var(--text-primary)] mb-1">Partial Fixed Refund</h5>
                    <p className="text-sm text-[var(--text-secondary)]">Set a fixed refund percentage (e.g., 50% refund)</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-default)]">
                    <h5 className="font-semibold text-[var(--text-primary)] mb-1">Custom Terms</h5>
                    <p className="text-sm text-[var(--text-secondary)]">Define your own refund terms and conditions</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-[var(--text-primary)]">Fee Structure:</h4>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-default)]">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-[var(--text-primary)]">Processing Fee</h5>
                      <span className="text-lg font-bold text-[var(--color-primary)]">3%</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">Of payment amount. Choose who pays: Sender, Receiver, or Split (50/50)</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-500/20">
                    <h5 className="font-semibold text-[var(--text-primary)] mb-1">No Hidden Fees</h5>
                    <p className="text-sm text-[var(--text-secondary)]">Transparent pricing with all fees clearly displayed during transaction creation</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Participant Setup Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-12 rounded-2xl border border-[var(--border-default)] bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-tertiary)] p-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <UserCheck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">Flexible Participant Setup</h3>
                <p className="text-sm text-[var(--text-secondary)]">Add participants your way</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center">
                    <User className="h-5 w-5 text-[var(--color-primary)]" />
                  </div>
                  <h4 className="text-lg font-semibold text-[var(--text-primary)]">During Transaction Creation</h4>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  When creating a transaction, you can immediately add the other participant (sender or receiver) by entering their user ID or selecting from your contacts. This is perfect when you already know who you're transacting with.
                </p>
                <ul className="space-y-2 text-sm text-[var(--text-secondary)] mt-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                    <span>Enter user ID directly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                    <span>Select from your contacts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                    <span>Transaction is ready immediately</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center">
                    <Link2 className="h-5 w-5 text-[var(--color-primary)]" />
                  </div>
                  <h4 className="text-lg font-semibold text-[var(--text-primary)]">Via Secure Link</h4>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Create the transaction first without adding the other participant. Then send them a secure link to join. They can click the link, review the transaction details, and complete their part. Ideal when you want to set up the transaction before the other party is ready.
                </p>
                <ul className="space-y-2 text-sm text-[var(--text-secondary)] mt-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                    <span>Create transaction first</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                    <span>Generate secure invitation link</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                    <span>Other party joins via link</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* App Showcase */}
      <AppShowcase variant="solutions" />

      {/* FAQ Section */}
      <section className="bg-[var(--bg-primary)] py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-6">
            {[
              {
                q: 'How much does Clarsix cost?',
                a: 'Our transparent fee structure is based on transaction value. Fees are typically split between buyer and seller, with no hidden charges.'
              },
              {
                q: 'How long does the process take?',
                a: 'Transaction duration depends on your chosen payment structure. For time-based transactions, funds are held for the agreed period set during creation. For milestone-based transactions, each phase is completed according to the timeline you establish. We process final payments within 24 hours of transaction completion or buyer approval.'
              },
              {
                q: "What if there's a dispute?",
                a: 'Our AI-powered support system reviews chat conversations, shared images, documents, and all transaction evidence to provide quick, fair resolutions. The complete communication history between both parties ensures transparent decision-making. If needed, our human support team provides additional assistance.'
              },
              {
                q: 'Is my money safe?',
                a: 'Absolutely. All funds are held in secure, segregated accounts and are never accessible by Clarsix for operational purposes.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)]"
              >
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{faq.q}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced for light mode */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-700 dark:via-teal-700 dark:to-cyan-700">
        <AnimatedGradient className="absolute inset-0 opacity-50" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6 text-white"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black">Ready to get started?</h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Join thousands of businesses protecting their transactions with Clarsix.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="bg-white text-emerald-600 hover:bg-white/90 border-0 shadow-xl"
                  onClick={() => navigate('/register')}
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Start free trial
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="bg-white/20 dark:bg-white/10 backdrop-blur-md !text-white border-white/40 dark:border-white/30 hover:bg-white/30 dark:hover:bg-white/20"
                  onClick={() => navigate('/contact')}
                >
                  Talk to sales
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      <ScrollToTopButton />
    </PublicLayout>
  );
};

export default Solutions;
