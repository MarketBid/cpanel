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
    title: 'Transactions & milestones',
    description: 'Escrow wallets for every deliverable with multi-signer approvals and time-boxed inspections.',
    icon: Layers,
    bullets: ['Milestone wallets', 'Acceptance SLAs', 'Neutral mediation'],
    tone: 'from-emerald-500 to-teal-600',
    stats: { value: '10K+', label: 'Transactions' },
  },
  {
    title: 'Platform payouts & APIs',
    description: 'Embed escrow into your product with events, webhooks, and SDKs for faster launches.',
    icon: Globe2,
    bullets: ['Events & webhooks', 'SDK starter kits', 'Risk scoring'],
    tone: 'from-blue-500 to-indigo-600',
    stats: { value: '99.9%', label: 'Uptime' },
  },
  {
    title: 'High-value assets',
    description: 'Protect vehicles, equipment, and property deals with identity verification and proof-of-delivery.',
    icon: Shield,
    bullets: ['Chain-of-custody', 'ID verification', 'Release evidence'],
    tone: 'from-purple-500 to-pink-600',
    stats: { value: '$50M+', label: 'Protected' },
  },
  {
    title: 'Enterprise & partners',
    description: 'Custom risk rules, compliance reviews, and dedicated rollout support for scaled programs.',
    icon: Building2,
    bullets: ['Custom risk rules', 'SLAs & support', 'White-glove rollout'],
    tone: 'from-orange-500 to-red-600',
    stats: { value: '24/7', label: 'Support' },
  },
];

const proofPoints = [
  {
    title: 'Compliance ready',
    desc: 'KYC/AML screening, sanctions checks, and audit logs for finance and legal.',
    icon: Fingerprint,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Programmable control',
    desc: 'Rules, milestones, and inspections trigger releases automatically—no manual chasing.',
    icon: Workflow,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    title: 'Speed to launch',
    desc: 'Sandbox credentials, prebuilt flows, and human onboarding help you ship in days.',
    icon: AlarmCheck,
    color: 'from-purple-500 to-pink-600',
  },
];

const comparison = [
  { label: 'Release automation', clarsix: 'Yes • milestones, timers, approvals', legacy: 'Manual approvals and emails', icon: Zap },
  { label: 'Identity + AML', clarsix: 'Built-in with audit trail', legacy: 'Requires external tooling', icon: Fingerprint },
  { label: 'Visibility', clarsix: 'Shared timeline, exports, alerts', legacy: 'Static statements', icon: TrendingUp },
  { label: 'Integration', clarsix: 'APIs, webhooks, SDKs', legacy: 'Custom builds required', icon: Globe2 },
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
            transition={{ duration: 0.8 }}
            className="max-w-3xl space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-white/10 backdrop-blur-md rounded-full border border-emerald-200 dark:border-white/20"
            >
              <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              <span className="text-sm font-medium text-emerald-900 dark:text-white">Solutions</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] text-balance text-slate-900 dark:text-white">
              Escrow built for every business, platform payouts, and{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-300 dark:via-teal-300 dark:to-cyan-300 bg-clip-text text-transparent">
                high-value assets
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-white/80 leading-relaxed">
              Move money with confidence: programmable rules, identity checks, and evidence capture built in—without marketplace or freelance clutter.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
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
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mb-4">
              Solutions for every use case
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              From simple transactions to complex multi-party workflows
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {solutionBlocks.map((solution, index) => {
              const Icon = solution.icon;
              return (
                <FloatingCard key={solution.title} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}
                    className="h-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-8 space-y-6 group relative overflow-hidden"
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
                    <div className="space-y-2 relative">
                      {solution.bullets.map((item, idx) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + idx * 0.1 }}
                          className="flex items-center gap-3 text-sm text-[var(--text-primary)]"
                        >
                          <div className={`h-6 w-6 rounded-lg bg-gradient-to-br ${solution.tone} flex items-center justify-center flex-shrink-0`}>
                            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span className="font-medium">{item}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Hover arrow */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileHover={{ opacity: 1, x: 0 }}
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
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)] mb-3">Proof</p>
                <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mb-4">
                  Compliance, automation, and human-grade clarity.
                </h2>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                  Designed for finance and legal: defensible audit trails, programmable releases, and real-time visibility for every stakeholder.
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
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)] mb-3">Why teams switch</p>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mb-4">Clarsix vs legacy escrow.</h2>
            <p className="text-lg text-[var(--text-secondary)]">Modern controls, API-first, and transparent collaboration for finance, legal, buyers, and sellers.</p>
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
