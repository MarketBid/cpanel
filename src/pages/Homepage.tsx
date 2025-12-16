import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Fingerprint,
  Handshake,
  Lock,
  Radar,
  Shield,
  Users,
  Sparkles,
  Globe,
  Calendar,
  Target,
  DollarSign,
  FileText,
  Link2,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout.tsx';
import Button from '../components/ui/Button';
import Carousel from '../components/ui/Carousel';
import { useAuth } from '../hooks/useAuth';
import AppShowcase from '../components/AppShowcase';
import AnimatedGradient from '../components/ui/AnimatedGradient';
import FloatingCard from '../components/ui/FloatingCard';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import ScrollToTopButton from '../components/ScrollToTopButton';

const valueProps = [
  {
    icon: Shield,
    title: 'Secure escrow protection',
    desc: 'Funds are held in segregated escrow accounts until delivery is confirmed. Both payment senders and receivers are protected with customizable refund policies and cancellation terms.',
  },
  {
    icon: Fingerprint,
    title: 'Quick setup & flexible transactions',
    desc: 'Get onboarded and start transacting in minutes. Create transactions as sender or receiver. Add participants during creation or send secure links for them to join. Choose from time-based or milestone-based contract types.',
  },
  {
    icon: FileCheck2,
    title: 'Smart contract types',
    desc: 'Time-based completion with auto-release buffers, or milestone-based with percentage payouts. Automatic fund release when conditions are met, with dispute resolution built-in.',
  },
];

const solutionTracks = [
  {
    title: 'Transactions & milestones',
    description:
      'Structure complex deliveries with escrow wallets, multi-signer approvals, and time-boxed inspection windows.',
    points: ['Milestone wallets', 'Acceptance SLAs', 'Neutral mediation'],
    accent: 'from-[#04805B] to-[#025037]',
  },
  {
    title: 'Comprehensive protection',
    description:
      'Multiple refund policies, transparent fees, and cancellation protection ensure both senders and receivers are fully protected.',
    points: ['Flexible refund policies', 'Transparent fee structure', 'Cancellation protection'],
    accent: 'from-[#04805B] to-[#0B7A5A]',
  },
  {
    title: 'High-value assets',
    description:
      'Secure equipment, vehicles, and property transactions with identity verification and proof-of-delivery capture.',
    points: ['Chain-of-custody', 'ID verification', 'Release evidence'],
    accent: 'from-[#025037] to-[#0F2F1F]',
  },
];

const howItWorks = [
  { title: 'Create transaction', desc: 'Anyone can create a transaction. Choose to be the payment sender or receiver, add the other participant during creation, or create and send a link for them to join.', icon: Activity },
  { title: 'Secure the funds', desc: 'Payment sender deposits funds into our secure escrow account. Money is held safely until delivery is confirmed or contract conditions are met.', icon: Lock },
  { title: 'Verify & release', desc: 'Choose time-based or milestone-based completion. Funds are automatically released when conditions are met, or manually upon approval.', icon: CheckCircle2 },
];

const analyticsCards = [
  { label: 'Live transactions', value: '48', badge: 'No anomalies', icon: Radar },
  { label: 'Avg. inspection window', value: '24h', badge: 'On policy', icon: Clock3 },
  { label: 'Compliance score', value: '99.3%', badge: 'KYC/AML clear', icon: Fingerprint },
  { label: 'Resolution time', value: '36h', badge: '↓ 22% vs last month', icon: Handshake },
];

const trustSignals = [
  { icon: Lock, title: 'Bank-grade security', desc: '256-bit encryption, continuous monitoring, and segregated accounts.' },
  { icon: AlertTriangle, title: 'Risk & anomaly guard', desc: 'Early-warning signals on behavior, velocity, and identity drift.' },
  { icon: Handshake, title: 'Neutral mediation', desc: 'Independent review paths and fair rules that keep parties aligned.' },
  { icon: Users, title: 'Role-based access', desc: 'Finance, legal, buyers, and sellers see only what they need—with audit logs.' },
];

const Homepage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  // Slower vanishing effect - fades over 600px instead of 300px
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);
  const scale = useTransform(scrollY, [0, 600], [1, 0.85]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <PublicLayout backgroundClassName="bg-[var(--bg-secondary)]">
      {/* Enhanced Hero with Interactive Elements */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 -mt-28 pt-28">
        <AnimatedGradient className="absolute inset-0 -z-10" />

        {/* Floating elements that follow mouse - Original sizes, more particles */}
        <motion.div
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          className="absolute top-20 left-[10%] w-2 h-2 rounded-full bg-emerald-500/60 dark:bg-[var(--color-primary)]/40 blur-sm"
        />
        <motion.div
          animate={{
            x: mousePosition.x * -0.03,
            y: mousePosition.y * 0.03,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          className="absolute top-40 right-[15%] w-3 h-3 rounded-full bg-teal-500/60 dark:bg-emerald-400/30 blur-sm"
        />
        <motion.div
          animate={{
            x: mousePosition.x * 0.025,
            y: mousePosition.y * -0.025,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          className="absolute bottom-32 left-[20%] w-2.5 h-2.5 rounded-full bg-cyan-500/60 dark:bg-teal-400/30 blur-sm"
        />
        {/* Additional floating particles - more dots */}
        <motion.div
          animate={{
            x: mousePosition.x * 0.015,
            y: mousePosition.y * 0.025,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          className="absolute top-[60%] right-[25%] w-2 h-2 rounded-full bg-purple-500/60 dark:bg-purple-400/40 blur-sm"
        />
        <motion.div
          animate={{
            x: mousePosition.x * -0.02,
            y: mousePosition.y * -0.015,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          className="absolute bottom-[40%] right-[10%] w-2 h-2 rounded-full bg-pink-500/60 dark:bg-pink-400/40 blur-sm"
        />
        <motion.div
          animate={{
            x: mousePosition.x * 0.018,
            y: mousePosition.y * -0.02,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          className="absolute top-[30%] left-[30%] w-2.5 h-2.5 rounded-full bg-indigo-500/60 dark:bg-indigo-400/40 blur-sm"
        />
        <motion.div
          animate={{
            x: mousePosition.x * -0.015,
            y: mousePosition.y * 0.018,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          className="absolute bottom-[25%] right-[30%] w-2 h-2 rounded-full bg-violet-500/60 dark:bg-violet-400/40 blur-sm"
        />
        <motion.div
          animate={{
            x: mousePosition.x * 0.022,
            y: mousePosition.y * 0.015,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          className="absolute top-[50%] left-[5%] w-2 h-2 rounded-full bg-emerald-400/50 dark:bg-emerald-300/30 blur-sm"
        />
        <motion.div
          animate={{
            x: mousePosition.x * -0.018,
            y: mousePosition.y * -0.022,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          className="absolute top-[70%] left-[40%] w-2.5 h-2.5 rounded-full bg-teal-400/50 dark:bg-teal-300/30 blur-sm"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 relative z-10">
          <div className="text-center">
            <motion.div style={{ opacity, scale }} className="space-y-8 max-w-5xl mx-auto">
              {/* Animated badge - Enhanced for light mode */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-white/10 backdrop-blur-md rounded-full border border-emerald-200 dark:border-white/20 mb-4"
              >
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                <span className="text-sm font-medium text-emerald-900 dark:text-white">Trusted by 10,000+ businesses worldwide</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] text-balance text-slate-900 dark:text-white"
              >
                Secure escrow payments between{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-300 dark:via-teal-300 dark:to-cyan-300 bg-clip-text text-transparent">
                  senders and receivers
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg sm:text-xl text-slate-600 dark:text-white/80 max-w-3xl mx-auto leading-relaxed"
              >
                Get started in minutes with quick onboarding and setup. Create secure transactions instantly—add participants during creation or send a link for them to join. Funds are held safely in escrow until delivery is confirmed—protecting both payment senders and receivers.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 50px rgba(16, 185, 129, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Button
                    size="lg"
                    variant="primary"
                    onClick={() => navigate(isAuthenticated ? '/transactions/create' : '/register')}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-[0_20px_50px_rgba(16,185,129,0.35)] border-0 !text-white"
                    rightIcon={<ArrowRight className="h-5 w-5 !text-white" />}
                  >
                    {isAuthenticated ? 'Open a transaction' : 'Start free trial'}
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-slate-100/80 dark:bg-white/10 backdrop-blur-md !text-slate-900 dark:!text-white border-slate-300 dark:border-white/30 hover:bg-slate-200 dark:hover:bg-white/20 font-semibold"
                    onClick={() => navigate('/contact')}
                  >
                    Talk to sales
                  </Button>
                </motion.div>
              </motion.div>

              {/* Trust indicators - Enhanced for light mode */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-8 text-sm text-slate-600 dark:text-white/60"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-600 dark:text-white/80" />
                  <span>Bank-grade security</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-white/80" />
                  <span>99.9% uptime</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-600 dark:text-white/80" />
                  <span>Global coverage</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator - Enhanced for light mode */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-slate-300 dark:border-white/30 rounded-full flex items-start justify-center p-2"
          >
            <motion.div className="w-1 h-2 bg-slate-400 dark:bg-white/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Enhanced Value Props with Floating Cards */}
      <section className="bg-[var(--bg-primary)] py-16 sm:py-20 lg:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-primary)]"
            >
              Why Clarsix
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--text-primary)] mt-3 text-balance"
            >
              Escrow-grade assurance with automation, compliance, and clarity.
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {valueProps.map((card, index) => {
              const Icon = card.icon;
              return (
                <FloatingCard key={card.title} delay={index * 0.15}>
                  <motion.div
                    whileHover={{
                      boxShadow: '0 20px 40px rgba(15, 157, 126, 0.15)',
                    }}
                    className="h-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 hover:border-[var(--color-primary)]/30 transition-all duration-300 relative overflow-hidden group"
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20"
                    >
                      <Icon className="h-7 w-7" />
                    </motion.div>

                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 relative">{card.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed relative">{card.desc}</p>

                    {/* Arrow indicator on hover */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      className="absolute bottom-6 right-6 text-[var(--color-primary)]"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </motion.div>
                </FloatingCard>
              );
            })}
          </div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 p-8 rounded-2xl bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-card)] border border-[var(--border-default)]"
          >
            {[
              { label: 'Transactions', value: 10000, suffix: '+' },
              { label: 'Active Users', value: 2500, suffix: '+' },
              { label: 'Success Rate', value: 99.9, suffix: '%' },
              { label: 'Countries', value: 50, suffix: '+' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-black text-[var(--color-primary)] mb-2">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-[var(--text-secondary)] font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Solutions - Enhanced for light mode */}
      <section className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50/30 dark:from-[#0A1F16] dark:text-white py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.15),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.12),transparent_35%)] dark:bg-[radial-gradient(circle_at_20%_30%,rgba(4,128,91,0.22),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(2,80,55,0.2),transparent_35%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-10"
          >
            <div className="flex-1">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-sm font-bold uppercase tracking-[0.12em] text-emerald-700 dark:text-white/70"
              >
                Solutions
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mt-3 text-slate-900 dark:text-white"
              >
                Built for every project, platforms, and high-value assets.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-slate-600 dark:text-white/75 mt-4 max-w-2xl"
              >
                Remove trust gaps with programmable logic, real-time tracking, and compliance by default.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-none"
            >
              <Button
                variant="primary"
                onClick={() => navigate('/solutions')}
                className="bg-emerald-600 dark:bg-white text-white dark:text-[var(--color-primary-dark)] hover:bg-emerald-700 dark:hover:bg-white/90 border-0 dark:border-white/20"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Explore solutions
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
            className="grid lg:grid-cols-3 gap-6 mt-10"
          >
            {solutionTracks.map((item, index) => (
              <motion.div
                key={item.title}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="rounded-2xl border border-emerald-200/50 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-6 space-y-4 hover:shadow-xl dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)] transition-shadow duration-300"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  transition={{ delay: index * 0.1 + 0.3, type: 'spring', stiffness: 200, damping: 15 }}
                  className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.accent} flex items-center justify-center`}
                >
                  <Shield className="h-5 w-5 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-white/75 leading-relaxed">{item.description}</p>
                <div className="space-y-2">
                  {item.points.map((point, pointIndex) => (
                    <motion.div
                      key={point}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + pointIndex * 0.1 + 0.5 }}
                      className="flex items-center gap-2 text-sm text-slate-700 dark:text-white/80"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#8CF5C0]" />
                      <span>{point}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* App Showcase with Screenshots */}
      <AppShowcase variant="homepage" />

      {/* How it works */}
      <section className="bg-[var(--bg-primary)] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-primary)]"
            >
              How it works
            </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--text-primary)] mt-3"
              >
                Simple escrow process: create, secure, and release.
              </motion.h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
            className="grid md:grid-cols-3 gap-6 mt-10"
          >
            {howItWorks.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  variants={{
                    hidden: { opacity: 0, x: idx % 2 === 0 ? -30 : 30 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-tertiary)] p-6 space-y-3 hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition-shadow duration-300"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.2 + 0.3, type: 'spring', stiffness: 200, damping: 15 }}
                      className="h-10 w-10 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold"
                    >
                      {idx + 1}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.2 + 0.4, type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <Icon className="h-5 w-5 text-[var(--color-primary-dark)]" />
                    </motion.div>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{step.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Contract Types & Protection */}
      <section className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50/30 dark:from-[#0A1F16] dark:text-white py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.15),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.12),transparent_35%)] dark:bg-[radial-gradient(circle_at_20%_30%,rgba(4,128,91,0.22),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(2,80,55,0.2),transparent_35%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center mb-12"
          >
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-sm font-bold uppercase tracking-[0.12em] text-emerald-700 dark:text-white/70"
            >
              Contract Types & Protection
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mt-3"
            >
              Flexible contracts with comprehensive protection
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-600 dark:text-white/75 mt-4"
            >
              Choose the contract type that fits your transaction, with customizable refund policies and transparent fee structures.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Contract Types */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Contract Types</h3>
              
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-emerald-200/50 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-6 space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Time-Based Completion</h4>
                    <p className="text-sm text-slate-600 dark:text-white/75">Set a completion date and time</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-white/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#8CF5C0]" />
                    <span>Automatic release after completion date</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#8CF5C0]" />
                    <span>Configurable auto-completion buffer (default 24 hours)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#8CF5C0]" />
                    <span>Funds released if no dispute within buffer period</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-emerald-200/50 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-6 space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Milestone-Based Completion</h4>
                    <p className="text-sm text-slate-600 dark:text-white/75">Break work into multiple milestones</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-white/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#8CF5C0]" />
                    <span>Define multiple milestones with percentage payouts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#8CF5C0]" />
                    <span>Set due dates and completion conditions for each</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#8CF5C0]" />
                    <span>Release funds incrementally as milestones are completed</span>
                  </li>
                </ul>
              </motion.div>
            </motion.div>

            {/* Protection Policies */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Protection & Policies</h3>
              
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-emerald-200/50 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-6 space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Refund Policies</h4>
                    <p className="text-sm text-slate-600 dark:text-white/75">Choose the protection level</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-white/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#8CF5C0]" />
                    <span><strong>Full Refund:</strong> 100% refundable if conditions aren't met</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#8CF5C0]" />
                    <span><strong>Conditional Refund:</strong> Refund based on specific conditions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#8CF5C0]" />
                    <span><strong>Partial Fixed:</strong> Set a fixed refund percentage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#8CF5C0]" />
                    <span><strong>Custom Terms:</strong> Define your own refund terms</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-emerald-200/50 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-6 space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Fee Structure</h4>
                    <p className="text-sm text-slate-600 dark:text-white/75">Transparent and fair pricing</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-white/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#8CF5C0]" />
                    <span><strong>Refund Processing Fee:</strong> 5% of payment amount</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#8CF5C0]" />
                    <span>Fee payer: Sender, Receiver, or Split (50/50)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#8CF5C0]" />
                    <span><strong>Cancellation Fee:</strong> 10% if sender cancels after work begins</span>
                  </li>
                </ul>
              </motion.div>
            </motion.div>
          </div>

          {/* Transaction Creation Process */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-2xl border border-emerald-200/50 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Link2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Flexible Participant Setup</h3>
                <p className="text-sm text-slate-600 dark:text-white/75">Add participants your way</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 dark:text-white">During Creation</h4>
                <p className="text-sm text-slate-600 dark:text-white/75">
                  Add the other participant (sender or receiver) directly when creating the transaction. Simply enter their user ID or select from your contacts.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 dark:text-white">Via Secure Link</h4>
                <p className="text-sm text-slate-600 dark:text-white/75">
                  Create the transaction first, then send a secure link to the other participant. They can join the transaction by clicking the link and completing their part.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Analytics preview */}
      <section className="bg-[var(--bg-secondary)] py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-primary)]"
              >
                Visibility
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]"
              >
                Live controls, audit-ready evidence.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-[var(--text-secondary)] leading-relaxed"
              >
                Monitor funds, inspection windows, and compliance health in one place. Export audit logs instantly, share status links with counterparties, and keep finance and legal aligned.
              </motion.p>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                className="flex flex-wrap gap-3"
              >
                {['Audit-ready', 'Real-time alerts', 'Transaction exports'].map((badge, index) => (
                  <motion.span
                    key={badge}
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      visible: { opacity: 1, scale: 1 },
                    }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]"
                  >
                    {badge}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center lg:justify-end"
            >
              <Carousel
                items={analyticsCards.map((card, index) => ({
                  ...card,
                  id: index,
                  icon: React.createElement(card.icon, { className: 'h-5 w-5 text-[var(--color-primary)]' }),
                }))}
                baseWidth={420}
                loop={true}
                autoplay={true}
                autoplayDelay={4000}
                pauseOnHover={true}
                renderItem={(item) => {
                  return (
                    <div className="w-full h-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 space-y-3 shadow-[0_12px_28px_rgba(0,0,0,0.06)] flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {item.icon}
                          <p className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-[0.08em]">{item.label}</p>
                        </div>
                        {item.badge && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-3xl font-black text-[var(--text-primary)]">{item.value}</p>
                    </div>
                  );
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-[var(--bg-primary)] py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-primary)]"
            >
              Trust signals
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--text-primary)] mt-3"
            >
              Security, transparency, and control in every step.
            </motion.h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10"
          >
            {trustSignals.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  whileHover={{ y: -6, borderColor: 'var(--color-primary)', transition: { duration: 0.3 } }}
                  className="rounded-2xl border border-[var(--border-default)] p-5 bg-[var(--bg-tertiary)] transition-all duration-300"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ delay: index * 0.1 + 0.3, type: 'spring', stiffness: 200, damping: 15 }}
                    className="h-10 w-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--color-primary)] mb-3"
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{pillar.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{pillar.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-hover)] to-[var(--color-primary-dark)] text-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-sm font-bold uppercase tracking-[0.12em] text-white/80"
          >
            Get started
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-balance"
          >
            Start transacting in minutes, not days.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-white/85 max-w-3xl mx-auto"
          >
            Quick onboarding and setup help you start creating secure escrow transactions in just a few minutes. Get started with guided assistance and start protecting your payments today.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Button
                size="lg"
                variant="secondary"
                className="bg-white !text-slate-900 hover:bg-white/90 dark:!text-slate-900"
                onClick={() => navigate(isAuthenticated ? '/transactions/create' : '/register')}
              >
                {isAuthenticated ? 'Open a transaction' : 'Create your account'}
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="!text-white !bg-transparent !border-white hover:!bg-white/10 [&>svg]:!text-white"
                onClick={() => navigate('/contact')}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Speak with product specialist
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
      <ScrollToTopButton />
    </PublicLayout>
  );
};

export default Homepage;
