import React, { useState, useEffect } from 'react';
import {
  Activity,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  Globe,
  Handshake,
  Link2,
  Lock,
  MessageSquare,
  Scale,
  Shield,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout.tsx';
import Button from '../components/ui/Button';

import { useAuth } from '../hooks/useAuth';
import AppShowcase from '../components/AppShowcase';
import AnimatedGradient from '../components/ui/AnimatedGradient';

import ScrollToTopButton from '../components/ScrollToTopButton';



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
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-white/10 backdrop-blur-md rounded-full border border-emerald-200 dark:border-white/20 mb-4"
              >
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                <span className="text-sm font-medium text-emerald-900 dark:text-white">Trusted by 10,000+ businesses worldwide</span>
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
                      delayChildren: 0.1,
                    },
                  },
                }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] text-balance text-slate-900 dark:text-white"
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
                    The Secure
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
                      Trust Vault Platform
                    </motion.span>
                  </span>
                </div>
                <br className="hidden sm:block" />
                <div className="overflow-hidden inline-block align-bottom">
                  <motion.span
                    variants={{
                      hidden: { y: "100%" },
                      visible: { y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
                    }}
                    className="inline-block"
                  >
                    for Senders & Receivers
                  </motion.span>
                </div>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-lg sm:text-xl text-slate-600 dark:text-white/80 max-w-3xl mx-auto leading-relaxed"
              >
                Clarsix is a secure trust vault platform that protects both buyers and sellers in online transactions. We hold payments safely until both parties are satisfied, eliminating fraud and building trust in every deal.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
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
                transition={{ duration: 1, delay: 1 }}
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
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-slate-300 dark:border-white/30 rounded-full flex items-start justify-center p-2"
          >
            <motion.div className="w-1 h-2 bg-slate-400 dark:bg-white/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* The Problem & Solution Section - Replaces Value Props Cards */}
      <section className="bg-[var(--bg-primary)] py-20 lg:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-sm font-bold uppercase tracking-[0.12em] text-red-500 mb-4 block">
                The Problem
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mb-6 leading-tight">
                Online transactions come with risks.
              </h2>
              <div className="space-y-6 text-lg text-[var(--text-secondary)]">
                <p>
                  Buyers worry about paying for goods they'll never receive. Sellers fear shipping products without getting paid.
                </p>
                <p>
                  Scammers exploit this lack of trust, costing honest people millions every year. The anxiety of "will I get scammed?" shouldn't be part of doing business.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl transform rotate-3" />
              <div className="relative bg-[var(--bg-card)] border border-[var(--border-default)] p-8 sm:p-12 rounded-3xl shadow-2xl">
                <span className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-primary)] mb-4 block">
                  The Solution
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-6">
                  Clarsix changes that.
                </h3>
                <p className="text-lg text-[var(--text-secondary)] mb-8 leading-relaxed">
                  We act as a neutral third party, holding funds securely in our <span className="font-bold text-[var(--text-primary)]">Trust Vault</span> until both sides fulfill their obligations.
                </p>
                <ul className="space-y-4">
                  {[
                    'No more anxiety',
                    'No more fraud',
                    'Just safe, transparent transactions'
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + (i * 0.1) }}
                      className="flex items-center gap-3 text-[var(--text-primary)] font-medium"
                    >
                      <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Clarsix - Split Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50/30 dark:from-[#0A1F16] dark:text-white py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.15),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.12),transparent_35%)] dark:bg-[radial-gradient(circle_at_20%_30%,rgba(4,128,91,0.22),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(2,80,55,0.2),transparent_35%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-bold uppercase tracking-[0.12em] text-emerald-700 dark:text-white/70">
              Why Choose Clarsix?
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-3 text-slate-900 dark:text-white">
              Protection for Everyone
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* For Buyers */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-emerald-100 dark:border-white/10"
            >
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">For Buyers</h3>
              <ul className="space-y-4">
                {[
                  'Pay only when you receive what you ordered',
                  'Inspect goods before funds are released',
                  'Protection against fraud and misrepresentation',
                  'Dispute resolution support if issues arise'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-white/80">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* For Sellers */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-emerald-100 dark:border-white/10"
            >
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">For Sellers</h3>
              <ul className="space-y-4">
                {[
                  'Guaranteed payment for legitimate transactions',
                  'No chargebacks after successful delivery',
                  'Build credibility with hesitant buyers',
                  'Focus on your business, not payment worries'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-white/80">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* App Showcase with Screenshots */}
      <AppShowcase variant="homepage" />

      {/* How it works - Updated with Chat */}
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
              Simple, Secure, Smart.
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
            className="grid md:grid-cols-4 gap-6 mt-10"
          >
            {[
              {
                title: 'Agreement',
                desc: 'Buyer and seller agree on transaction terms and choose Clarsix as their trust vault partner.',
                icon: Handshake
              },
              {
                title: 'Secure Payment',
                desc: 'Buyer deposits payment into our secure trust vault account. Funds are held safely and cannot be accessed by either party.',
                icon: Lock
              },
              {
                title: 'Delivery & Inspection',
                desc: 'Seller ships product. Buyer inspects. Use our internal chat system to communicate and share updates throughout.',
                icon: Activity
              },
              {
                title: 'Release',
                desc: 'Once satisfied, we release payment. Our AI-powered support system helps resolve any disputes fairly.',
                icon: CheckCircle2
              }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0 },
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Header 1: Contract Types */}
            <motion.h3
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-2xl font-bold text-slate-900 dark:text-white md:col-start-1 md:row-start-1"
            >
              Contract Types
            </motion.h3>

            {/* Card 1: Time-Based */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-emerald-200/50 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-6 space-y-4 md:col-start-1 md:row-start-2 h-full"
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

            {/* Card 2: Milestone-Based */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-emerald-200/50 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-6 space-y-4 md:col-start-1 md:row-start-3 h-full"
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

            {/* Header 2: Protection & Policies */}
            <motion.h3
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-2xl font-bold text-slate-900 dark:text-white md:col-start-2 md:row-start-1"
            >
              Protection & Policies
            </motion.h3>

            {/* Card 3: Refund Policies */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-emerald-200/50 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-6 space-y-4 md:col-start-2 md:row-start-2 h-full"
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

            {/* Card 4: Fee Structure */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-emerald-200/50 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-6 space-y-4 md:col-start-2 md:row-start-3 h-full"
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
                  <span><strong>Processing Fee:</strong> 3% of payment amount</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#8CF5C0]" />
                  <span>Fee payer: Sender, Receiver, or Split (50/50)</span>
                </li>
              </ul>
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

      {/* AI & Chat Feature Highlight */}
      <section className="bg-[var(--bg-secondary)] py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <span className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-primary)]">
                Advanced Features
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">
                AI-Powered Resolution & Internal Chat
              </h2>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                Communication is key to trust. That's why we built a secure internal chat system directly into every transaction.
              </p>

              <div className="space-y-6 pt-4">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 text-purple-600 dark:text-purple-400">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Internal Chat System</h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Communicate directly with your counterparty. Share updates, photos, and documents securely within the platform. All history is preserved for transparency.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
                    <Scale className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">AI-Powered Dispute Resolution</h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      If a dispute arises, our AI system analyzes the entire chat history, shared documents, and transaction evidence to provide a fair, unbiased resolution recommendation instantly.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[500px] bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center p-8"
            >
              {/* Abstract Representation of Chat/AI */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)]" />
              <div className="relative z-10 w-full max-w-md space-y-4">
                {/* Mock Chat Message 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none shadow-sm self-start w-3/4"
                >
                  <p className="text-xs text-slate-400 mb-1">Seller • 10:30 AM</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200">I've shipped the item. Here is the tracking number and a photo of the package.</p>
                </motion.div>

                {/* Mock Chat Message 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl rounded-tr-none shadow-sm ml-auto w-3/4"
                >
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mb-1 text-right">You • 10:35 AM</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200">Thanks! I see the photo. I'll inspect it once it arrives.</p>
                </motion.div>

                {/* AI Analysis Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mx-auto bg-purple-600 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 w-fit shadow-lg shadow-purple-500/30 mt-8"
                >
                  <Sparkles className="h-3 w-3" />
                  AI Analysis: Transaction Proceeding Normally
                </motion.div>
              </div>
            </motion.div>
          </div>
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
