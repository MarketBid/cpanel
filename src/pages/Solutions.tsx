import React from 'react';
import {
  AlarmCheck,
  ArrowRight,
  BadgeCheck,
  Building2,
  Fingerprint,
  Globe2,
  Layers,
  Shield,
  Workflow,
  Zap,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Target,
  DollarSign,
  FileText,
  User,
  UserCheck,
  Link2,
  Clock,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout.tsx';
import Button from '../components/ui/Button';
import AppShowcase from '../components/AppShowcase';
import AnimatedGradient from '../components/ui/AnimatedGradient';
import FloatingCard from '../components/ui/FloatingCard';
import ScrollToTopButton from '../components/ScrollToTopButton';

const solutionBlocks = [
  {
    title: 'Time-Based Contracts',
    description: 'Set completion dates with automatic fund release. Perfect for fixed-term projects and services with clear deadlines.',
    icon: Calendar,
    bullets: ['Completion date & time', 'Auto-release buffer (24h default)', 'Automatic fund release'],
    tone: 'from-emerald-500 to-teal-600',
    stats: { value: '10K+', label: 'Transactions' },
  },
  {
    title: 'Milestone-Based Contracts',
    description: 'Break work into multiple milestones with percentage-based payouts. Ideal for long-term projects and phased deliveries.',
    icon: Target,
    bullets: ['Multiple milestones', 'Percentage payouts', 'Due dates & conditions'],
    tone: 'from-blue-500 to-indigo-600',
    stats: { value: '99.9%', label: 'Success Rate' },
  },
  {
    title: 'Flexible Participant Setup',
    description: 'Create transactions as sender or receiver. Add participants during creation or send secure links for them to join.',
    icon: Link2,
    bullets: ['Add during creation', 'Send secure links', 'Role-based access'],
    tone: 'from-purple-500 to-pink-600',
    stats: { value: '50+', label: 'Countries' },
  },
  {
    title: 'Protection & Refund Policies',
    description: 'Comprehensive protection with customizable refund policies, cancellation terms, and transparent fee structures.',
    icon: Shield,
    bullets: ['Multiple refund options', 'Cancellation protection', 'Transparent fees'],
    tone: 'from-orange-500 to-red-600',
    stats: { value: '24/7', label: 'Support' },
  },
];

const proofPoints = [
  {
    title: 'Secure escrow protection',
    desc: 'Funds held in segregated accounts until delivery confirmation. Both senders and receivers protected with customizable policies.',
    icon: Shield,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Flexible contract types',
    desc: 'Time-based with auto-release or milestone-based with percentage payouts. Choose what works best for your transaction.',
    icon: Workflow,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    title: 'Easy participant setup',
    desc: 'Add participants during creation or send secure links. Anyone can create transactions as sender or receiver.',
    icon: UserCheck,
    color: 'from-purple-500 to-pink-600',
  },
];

const comparison = [
  { label: 'Contract types', clarsix: 'Time-based & milestone-based with auto-release', legacy: 'Single contract type only', icon: FileText },
  { label: 'Participant setup', clarsix: 'Add during creation or send secure links', legacy: 'Manual coordination required', icon: Link2 },
  { label: 'Refund protection', clarsix: 'Multiple policies: full, conditional, partial, custom', legacy: 'Limited refund options', icon: Shield },
  { label: 'Fee transparency', clarsix: 'Clear fee structure: 5% refund, 10% cancellation', legacy: 'Hidden fees and unclear terms', icon: DollarSign },
];

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
                  Secure escrow payments
                </motion.span>
              </div>
              <br className="hidden sm:block" />
              <div className="overflow-hidden inline-block align-bottom">
                <motion.span
                  variants={{
                    hidden: { y: "100%" },
                    visible: { y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
                  }}
                  className="inline-block mr-[0.2em]"
                >
                  for
                </motion.span>
              </div>
              {' '}
              <div className="overflow-hidden inline-block align-bottom">
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-300 dark:via-teal-300 dark:to-cyan-300 bg-clip-text text-transparent inline-block">
                  <motion.span
                    variants={{
                      hidden: { y: "100%" },
                      visible: { y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
                    }}
                    className="inline-block"
                  >
                    payment senders and receivers
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
              Get onboarded and start transacting in minutes. Create secure transactions instantly—choose your role as sender or receiver, add participants during creation or send secure links. Funds are protected with customizable contract types, refund policies, and transparent fee structures.
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

      {/* Solution Blocks with Enhanced Cards */}
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
              Escrow solutions for every transaction type
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              From simple one-time payments to complex multi-milestone projects, protect both senders and receivers with flexible contract types
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {solutionBlocks.map((solution, index) => {
              const Icon = solution.icon;
              return (
                <FloatingCard key={solution.title} delay={index * 0.1}>
                  <motion.div
                    whileHover={{
                      y: -5,
                      boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                      borderColor: 'var(--color-primary)'
                    }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-8 space-y-6 group relative overflow-hidden transition-colors"
                  >
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${solution.tone} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                    {/* Icon and Stats */}
                    <div className="flex items-start justify-between relative">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${solution.tone} text-white flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="h-7 w-7" />
                      </motion.div>

                      <div className="text-right">
                        <div className="text-2xl font-black text-[var(--text-primary)]">{solution.stats.value}</div>
                        <div className="text-xs text-[var(--text-tertiary)] font-medium">{solution.stats.label}</div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative space-y-3">
                      <h3 className="text-2xl font-bold text-[var(--text-primary)]">{solution.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{solution.description}</p>
                    </div>

                    {/* Features */}
                    <motion.div
                      className="space-y-2 relative"
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={{
                        visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
                      }}
                    >
                      {solution.bullets.map((item) => (
                        <motion.div
                          key={item}
                          variants={{
                            hidden: { opacity: 0, x: -20 },
                            visible: { opacity: 1, x: 0 }
                          }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          className="flex items-center gap-3 text-sm text-[var(--text-primary)]"
                        >
                          <div className={`h-6 w-6 rounded-lg bg-gradient-to-br ${solution.tone} flex items-center justify-center flex-shrink-0`}>
                            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span className="font-medium">{item}</span>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Hover arrow */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute bottom-8 right-8 text-[var(--text-tertiary)] group-hover:text-[var(--color-primary)]"
                    >
                      <ArrowRight className="h-6 w-6" />
                    </motion.div>
                  </motion.div>
                </FloatingCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Proof Points Section */}
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
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)] mb-3">Why Clarsix</p>
                <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mb-4">
                  Secure escrow with flexible contracts and comprehensive protection.
                </h2>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                  Built for payment senders and receivers: choose your contract type, set protection policies, and add participants your way. All with transparent fees and automatic fund release.
                </p>
              </div>

              <div className="grid gap-4">
                {proofPoints.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 10 }}
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

            {/* Right: Live Control Panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-2xl p-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Live control panel</h3>
                <BadgeCheck className="h-6 w-6 text-[var(--color-primary)]" />
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Active deals', value: '48', trend: '+12%' },
                  { label: 'Avg. inspection window', value: '24h', trend: 'On policy' },
                  { label: 'Compliance score', value: '99.3%', trend: 'KYC/AML clear' },
                  { label: 'Resolution time', value: '36h', trend: '↓ 22% vs last month' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <div>
                      <span className="text-sm text-[var(--text-secondary)] font-medium">{stat.label}</span>
                      <div className="text-2xl font-black text-[var(--text-primary)] mt-1">{stat.value}</div>
                    </div>
                    <span className="text-xs px-3 py-1.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold">
                      {stat.trend}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-500/20 p-4">
                  <p className="text-xs text-[var(--text-secondary)] font-medium mb-1">Risk monitor</p>
                  <p className="text-sm font-bold text-emerald-600">No anomalies</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border border-blue-500/20 p-4">
                  <p className="text-xs text-[var(--text-secondary)] font-medium mb-1">Exports</p>
                  <p className="text-sm font-bold text-blue-600">Audit-ready</p>
                </div>
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
                      <h5 className="font-semibold text-[var(--text-primary)]">Refund Processing Fee</h5>
                      <span className="text-lg font-bold text-[var(--color-primary)]">5%</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">Of payment amount. Choose who pays: Sender, Receiver, or Split (50/50)</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-default)]">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-[var(--text-primary)]">Cancellation Fee</h5>
                      <span className="text-lg font-bold text-[var(--color-primary)]">10%</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">Retained if payment sender cancels after work has begun</p>
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

      {/* Comparison Table */}
      <section className="bg-[var(--bg-primary)] py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl text-center mx-auto"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)] mb-3">Why choose Clarsix</p>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mb-4">Clarsix vs traditional escrow services.</h2>
            <p className="text-lg text-[var(--text-secondary)]">Flexible contract types, easy participant setup, comprehensive protection policies, and transparent fees—all designed for modern payment senders and receivers.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-[var(--border-default)] overflow-hidden bg-[var(--bg-card)] shadow-xl"
          >
            <div className="grid grid-cols-3 bg-gradient-to-r from-[var(--bg-tertiary)] to-[var(--bg-secondary)] text-sm font-semibold text-[var(--text-primary)] uppercase tracking-[0.08em]">
              <div className="px-6 py-4">Capability</div>
              <div className="px-6 py-4">Clarsix</div>
              <div className="px-6 py-4">Legacy escrow</div>
            </div>
            <div>
              {comparison.map((row, index) => {
                const Icon = row.icon;
                return (
                  <motion.div
                    key={row.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="grid grid-cols-3 border-t border-[var(--border-default)] text-sm hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <div className="px-6 py-4 flex items-center gap-3">
                      <Icon className="h-5 w-5 text-[var(--text-tertiary)]" />
                      <span className="font-semibold text-[var(--text-primary)]">{row.label}</span>
                    </div>
                    <div className="px-6 py-4 flex items-center">
                      <span className="inline-flex items-center gap-2 text-[var(--color-primary)] font-semibold">
                        <CheckCircle2 className="h-4 w-4" />
                        {row.clarsix}
                      </span>
                    </div>
                    <div className="px-6 py-4 flex items-center text-[var(--text-secondary)]">{row.legacy}</div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
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
