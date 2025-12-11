import React from 'react';
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
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout.tsx';
import Button from '../components/ui/Button';
import Carousel from '../components/ui/Carousel';
import { useAuth } from '../hooks/useAuth';
import AppShowcase from '../components/AppShowcase';

const valueProps = [
  {
    icon: Shield,
    title: 'Escrow-grade trust',
    desc: 'Segregated accounts, layered approvals, and transparent audit trails built for financial-grade reliability.',
  },
  {
    icon: Fingerprint,
    title: 'Identity + compliance',
    desc: 'KYC/AML screening, sanctions checks, and proof-of-delivery evidence so every release is defensible.',
  },
  {
    icon: FileCheck2,
    title: 'Programmable releases',
    desc: 'Milestones, inspections, and rules trigger funds automatically—no more manual chasing or ambiguity.',
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
    title: 'Platform payouts & APIs',
    description:
      'Embed escrow into your product with clean APIs, event streams, and sandbox credentials for rapid rollout.',
    points: ['Events & webhooks', 'SDK starter kits', 'Risk scoring'],
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
  { title: 'Scope the deal', desc: 'Capture parties, milestones, and acceptance rules in minutes.', icon: Activity },
  { title: 'Secure the funds', desc: 'Money sits in safeguarded accounts until programmed conditions are met.', icon: Lock },
  { title: 'Verify & release', desc: 'Evidence, approvals, and timers unlock payouts automatically.', icon: CheckCircle2 },
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

  return (
    <PublicLayout backgroundClassName="bg-[var(--bg-secondary)]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(4,128,91,0.16),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(2,80,55,0.18),transparent_40%),linear-gradient(135deg,#0E1F1A_0%,#0B1814_35%,#0E1F1A_100%)]" />
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -left-32 top-10 h-72 w-72 bg-[#04805B]/20 blur-3xl rounded-full"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -right-32 bottom-0 h-80 w-80 bg-[#025037]/25 blur-3xl rounded-full"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 lg:pb-24">
          <div className="text-center">
            <div className="text-white space-y-6 max-w-4xl mx-auto">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] text-balance"
              >
                Secure funds, automate releases, prove delivery.
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="flex flex-col sm:flex-row gap-3 justify-center"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Button
                    size="lg"
                    variant="primary"
                    onClick={() => navigate(isAuthenticated ? '/transactions/create' : '/register')}
                    className="shadow-[0_18px_40px_rgba(4,128,91,0.35)]"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    {isAuthenticated ? 'Open a transaction' : 'Start in minutes'}
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Button
                    size="lg"
                    variant="primary"
                    className="shadow-[0_18px_40px_rgba(4,128,91,0.35)]"
                    onClick={() => navigate('/contact')}
                  >
                    Talk with product
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
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
            className="grid md:grid-cols-3 gap-6 mt-10"
          >
            {valueProps.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-tertiary)] p-6 hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition-shadow duration-300"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ delay: index * 0.1 + 0.3, type: 'spring', stiffness: 200, damping: 15 }}
                    className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white flex items-center justify-center mb-4"
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{card.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{card.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Solutions */}
      <section className="bg-[#0A1F16] text-white py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(4,128,91,0.22),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(2,80,55,0.2),transparent_35%)]" />
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
                className="text-sm font-bold uppercase tracking-[0.12em] text-white/70"
              >
                Solutions
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mt-3 text-white"
              >
                Built for every project, platforms, and high-value assets.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-white/75 mt-4 max-w-2xl"
              >
                Remove trust gaps with programmable logic, real-time tracking, and compliance by default—no marketplace or freelance clutter.
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
                className="bg-white text-[var(--color-primary-dark)] hover:bg-white/90 border border-white/20 !text-[var(--color-primary-dark)]"
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
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 space-y-4 hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)] transition-shadow duration-300"
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
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <p className="text-sm text-white/75 leading-relaxed">{item.description}</p>
                <div className="space-y-2">
                  {item.points.map((point, pointIndex) => (
                    <motion.div
                      key={point}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + pointIndex * 0.1 + 0.5 }}
                      className="flex items-center gap-2 text-sm text-white/80"
                    >
                      <CheckCircle2 className="h-4 w-4 text-[#8CF5C0]" />
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
              From agreement to release with zero guesswork.
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
                {['Audit-ready', 'Real-time alerts', 'Exports & APIs'].map((badge, index) => (
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
            Launch escrow-grade protection in days, not quarters.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-white/85 max-w-3xl mx-auto"
          >
            Guided onboarding, sandbox credentials, and human support to tailor Clarsix to your project, platform payouts, or high-value asset sales.
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
                className="bg-white text-[var(--color-primary-dark)] hover:bg-white/90"
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
    </PublicLayout>
  );
};

export default Homepage;
