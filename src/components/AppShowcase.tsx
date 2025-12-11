import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Monitor, Smartphone, ArrowRight, Sparkles } from 'lucide-react';

interface Screenshot {
  id: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  highlight?: string;
}

interface AppShowcaseProps {
  variant?: 'homepage' | 'solutions';
}

const screenshots: Screenshot[] = [
  {
    id: 'dashboard',
    title: 'Real-time Dashboard',
    description: 'Monitor all transactions, revenue, and analytics at a glance',
    image: '/screenshots/dashboard.png',
    alt: 'Dashboard view showing transaction statistics and recent activity',
    highlight: 'Live tracking'
  },
  {
    id: 'transactions',
    title: 'Transaction Management',
    description: 'Filter, search, and manage all your transactions in one place',
    image: '/screenshots/transactions.png',
    alt: 'Transactions list with filtering and sorting options',
    highlight: 'Smart filters'
  },
  {
    id: 'transaction-details',
    title: 'Detailed Insights',
    description: 'Complete transaction history, participants, and timeline',
    image: '/screenshots/transaction-details.png',
    alt: 'Transaction details page with participant information',
    highlight: 'Full transparency'
  },
  {
    id: 'create-transaction',
    title: 'Simple Creation',
    description: 'Set up secure escrow transactions in minutes',
    image: '/screenshots/create-transaction.png',
    alt: 'Create transaction form with role selection',
    highlight: 'Quick setup'
  },
  {
    id: 'payment',
    title: 'Secure Payments',
    description: 'Process payments with escrow protection and multiple methods',
    image: '/screenshots/payment.png',
    alt: 'Payment page with escrow protection details',
    highlight: 'Protected'
  }
];

const AppShowcase: React.FC<AppShowcaseProps> = ({ variant = 'homepage' }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (variant === 'homepage') {
    return (
      <section className="relative py-16 sm:py-20 lg:py-28 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)]" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-20 -right-20 w-96 h-96 bg-[var(--color-primary)] rounded-full blur-[120px] opacity-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-20 -left-20 w-96 h-96 bg-[var(--color-primary-dark)] rounded-full blur-[120px] opacity-20"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full text-sm font-semibold mb-6"
            >
              <Sparkles className="h-4 w-4" />
              See it in action
            </motion.div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-4">
              Powerful platform, intuitive experience.
            </h2>
            <p className="text-lg text-[var(--text-secondary)]">
              Every feature designed for clarity, speed, and trust—from dashboard to delivery confirmation.
            </p>
          </motion.div>

          {/* Floating screenshots showcase */}
          <div className="relative">
            {/* Main large screenshot */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="relative z-20"
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] border-2 border-[var(--border-default)] bg-[var(--bg-card)]"
              >
                {/* Browser chrome mockup */}
                <div className="bg-[var(--bg-tertiary)] px-4 py-3 border-b border-[var(--border-default)] flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 mx-4 bg-[var(--bg-card)] rounded-lg px-3 py-1 text-xs text-[var(--text-tertiary)]">
                    clarsix.com/dashboard
                  </div>
                </div>
                {/* Screenshot placeholder - will be replaced with actual image */}
                <div className="aspect-[16/10] bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] flex items-center justify-center relative">
                  <img 
                    src="/screenshots/dashboard.png" 
                    alt="Dashboard interface" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="flex flex-col items-center justify-center gap-4"><div class="text-[var(--text-tertiary)]"><Monitor class="h-16 w-16" /></div><p class="text-[var(--text-secondary)] text-sm">Dashboard Preview</p></div>';
                      }
                    }}
                  />
                  {/* Privacy blur for transaction IDs */}
                  <style>{`
                    .transaction-id-blur {
                      position: absolute;
                      background: rgba(255, 255, 255, 0.9);
                      backdrop-filter: blur(8px);
                      -webkit-backdrop-filter: blur(8px);
                      pointer-events: none;
                    }
                    .dark .transaction-id-blur {
                      background: rgba(0, 0, 0, 0.7);
                    }
                  `}</style>
                </div>
              </motion.div>
            </motion.div>

            {/* Floating smaller screenshots */}
            <motion.div
              initial={{ opacity: 0, x: -60, rotate: -6 }}
              whileInView={{ opacity: 1, x: 0, rotate: -6 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute -left-8 top-20 w-72 hidden lg:block z-10"
            >
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotate: [-6, -8, -6],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                whileHover={{ scale: 1.05, rotate: -3, zIndex: 30 }}
                className="rounded-xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.2)] border border-[var(--border-default)] bg-[var(--bg-card)] cursor-pointer"
              >
                <div className="bg-[var(--bg-tertiary)] px-3 py-2 border-b border-[var(--border-default)] flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                </div>
                <div className="aspect-[4/3] bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] flex items-center justify-center p-2 relative">
                  <img 
                    src="/screenshots/transactions.png" 
                    alt="Transactions list" 
                    className="w-full h-full object-cover rounded"
                    style={{ filter: 'blur(0px)' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  {/* Blur overlay for transaction IDs - positioned over CODE column */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="transaction-id-blur" style={{ 
                      position: 'absolute',
                      left: '35%',
                      right: '35%',
                      top: '25%',
                      height: '60%',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-4 -right-4 bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
              >
                Transaction List
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60, rotate: 6 }}
              whileInView={{ opacity: 1, x: 0, rotate: 6 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute -right-8 bottom-20 w-80 hidden lg:block z-10"
            >
              <motion.div
                animate={{
                  y: [0, 15, 0],
                  rotate: [6, 8, 6],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                whileHover={{ scale: 1.05, rotate: 3, zIndex: 30 }}
                className="rounded-xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.2)] border border-[var(--border-default)] bg-[var(--bg-card)] cursor-pointer"
              >
                <div className="bg-[var(--bg-tertiary)] px-3 py-2 border-b border-[var(--border-default)] flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                </div>
                <div className="aspect-[4/3] bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] flex items-center justify-center p-2 relative">
                  <img 
                    src="/screenshots/payment.png" 
                    alt="Payment processing" 
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  {/* Blur overlay for transaction ID */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="transaction-id-blur" style={{ 
                      position: 'absolute',
                      left: '20%',
                      right: '20%',
                      top: '15%',
                      height: '12%',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="absolute -bottom-4 -left-4 bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
              >
                Secure Payment
              </motion.div>
            </motion.div>
          </div>

          {/* Feature highlights with screenshots */}
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
            className="grid md:grid-cols-3 gap-6 mt-20"
          >
            {[
              {
                title: 'Transaction Details',
                desc: 'Complete visibility into every transaction',
                image: '/screenshots/transaction-details.png',
                icon: Monitor,
              },
              {
                title: 'Join Transactions',
                desc: 'Seamless onboarding for participants',
                image: '/screenshots/join-transaction.png',
                icon: Smartphone,
              },
              {
                title: 'Create & Track',
                desc: 'Easy setup with real-time updates',
                image: '/screenshots/create-transaction.png',
                icon: ArrowRight,
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.6 }}
                  className="group"
                >
                  <motion.div
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="relative rounded-xl overflow-hidden shadow-lg border border-[var(--border-default)] bg-[var(--bg-card)] cursor-pointer"
                  >
                    {/* Screenshot */}
                    <div className="aspect-[16/10] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] overflow-hidden relative">
                      <motion.img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      {/* Privacy blur for transaction IDs */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="transaction-id-blur" style={{ 
                          position: 'absolute',
                          left: '25%',
                          right: '25%',
                          top: '20%',
                          height: '15%',
                          borderRadius: '6px',
                          zIndex: 10
                        }} />
                      </div>
                      {/* Overlay on hover - improved contrast for light mode */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6" style={{ zIndex: 20 }}>
                        <div className="text-white">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="h-5 w-5 text-white" />
                            <span className="font-bold text-white">{feature.title}</span>
                          </div>
                          <p className="text-sm text-white">{feature.desc}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  {/* Label below */}
                  <div className="mt-4 px-2">
                    <h4 className="font-bold text-[var(--text-primary)] mb-1">{feature.title}</h4>
                    <p className="text-sm text-[var(--text-secondary)]">{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    );
  }

  // Solutions page variant - Horizontal scrolling showcase
  return (
    <section className="py-16 sm:py-20 bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-primary)] mb-3">
            Platform Preview
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">
            Built for efficiency and trust.
          </h2>
        </motion.div>

        {/* Interactive screenshot gallery */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {screenshots.map((screenshot, idx) => (
              <motion.div
                key={screenshot.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex-none w-[85vw] sm:w-[500px] snap-center"
                onMouseEnter={() => setActiveIndex(idx)}
              >
                <motion.div
                  whileHover={{ y: -12, scale: 1.03 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="relative group"
                >
                  {/* Screenshot container */}
                  <div className="rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] border-2 border-[var(--border-default)] bg-[var(--bg-card)]">
                    {/* Browser chrome */}
                    <div className="bg-[var(--bg-tertiary)] px-4 py-2.5 border-b border-[var(--border-default)] flex items-center gap-3">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)]">clarsix.com</div>
                    </div>
                    {/* Screenshot */}
                    <div className="aspect-[16/11] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] relative">
                      <img
                        src={screenshot.image}
                        alt={screenshot.alt}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      {/* Privacy blur for transaction IDs */}
                      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
                        <div className="transaction-id-blur" style={{ 
                          position: 'absolute',
                          left: '20%',
                          right: '20%',
                          top: '22%',
                          height: '12%',
                          borderRadius: '6px'
                        }} />
                      </div>
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ zIndex: 10 }} />
                    </div>
                  </div>

                  {/* Highlight badge */}
                  {screenshot.highlight && (
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: idx * 0.1 + 0.3, type: 'spring' }}
                      className="absolute -top-3 -right-3 bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
                    >
                      {screenshot.highlight}
                    </motion.div>
                  )}

                  {/* Info card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: activeIndex === idx ? 1 : 0.7, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 px-2"
                  >
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                      {screenshot.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {screenshot.description}
                    </p>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Progress indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {screenshots.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === idx
                    ? 'w-8 bg-[var(--color-primary)]'
                    : 'w-2 bg-[var(--border-default)] hover:bg-[var(--border-medium)]'
                }`}
                aria-label={`View screenshot ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Custom scrollbar hide */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default AppShowcase;

