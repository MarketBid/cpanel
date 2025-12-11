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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout.tsx';
import Button from '../components/ui/Button';
import AppShowcase from '../components/AppShowcase';

const solutionBlocks = [
  {
    title: 'Transactions & milestones',
    description: 'Escrow wallets for every deliverable with multi-signer approvals and time-boxed inspections.',
    icon: Layers,
    bullets: ['Milestone wallets', 'Acceptance SLAs', 'Neutral mediation'],
    tone: 'from-[#04805B] to-[#025037]',
  },
  {
    title: 'Platform payouts & APIs',
    description: 'Embed escrow into your product with events, webhooks, and SDKs for faster launches.',
    icon: Globe2,
    bullets: ['Events & webhooks', 'SDK starter kits', 'Risk scoring'],
    tone: 'from-[#04805B] to-[#0B7A5A]',
  },
  {
    title: 'High-value assets',
    description: 'Protect vehicles, equipment, and property deals with identity verification and proof-of-delivery.',
    icon: Shield,
    bullets: ['Chain-of-custody', 'ID verification', 'Release evidence'],
    tone: 'from-[#025037] to-[#0F2F1F]',
  },
  {
    title: 'Enterprise & partners',
    description: 'Custom risk rules, compliance reviews, and dedicated rollout support for scaled programs.',
    icon: Building2,
    bullets: ['Custom risk rules', 'SLAs & support', 'White-glove rollout'],
    tone: 'from-[#025037] to-[#0A1F16]',
  },
];

const proofPoints = [
  {
    title: 'Compliance ready',
    desc: 'KYC/AML screening, sanctions checks, and audit logs for finance and legal.',
    icon: Fingerprint,
  },
  {
    title: 'Programmable control',
    desc: 'Rules, milestones, and inspections trigger releases automatically—no manual chasing.',
    icon: Workflow,
  },
  {
    title: 'Speed to launch',
    desc: 'Sandbox credentials, prebuilt flows, and human onboarding help you ship in days.',
    icon: AlarmCheck,
  },
];

const comparison = [
  { label: 'Release automation', clarsix: 'Yes • milestones, timers, approvals', legacy: 'Manual approvals and emails' },
  { label: 'Identity + AML', clarsix: 'Built-in with audit trail', legacy: 'Requires external tooling' },
  { label: 'Visibility', clarsix: 'Shared timeline, exports, alerts', legacy: 'Static statements' },
  { label: 'Integration', clarsix: 'APIs, webhooks, SDKs', legacy: 'Custom builds required' },
];

const Solutions: React.FC = () => {
  const navigate = useNavigate();
  return (
    <PublicLayout>
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_10%_20%,rgba(4,128,91,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(2,80,55,0.18),transparent_35%),linear-gradient(135deg,#0A1F16_0%,#0E1F1A_45%,#0A1F16_100%)] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/70">Solutions</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] text-balance text-white">
              Escrow built for every business, platform payouts, and high-value assets.
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Move money with confidence: programmable rules, identity checks, and evidence capture built in—without marketplace or freelance clutter.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="primary" size="lg" className="shadow-[0_18px_40px_rgba(4,128,91,0.35)]" rightIcon={<ArrowRight className="h-4 w-4" />} onClick={() => navigate('/contact')}>
                Talk with us
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--bg-primary)] py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {solutionBlocks.map((solution) => {
              const Icon = solution.icon;
              return (
                <div
                  key={solution.title}
                  className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-tertiary)] p-6 space-y-4 hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition-transform hover:-translate-y-1"
                >
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${solution.tone} text-white flex items-center justify-center`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">{solution.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{solution.description}</p>
                  <div className="space-y-2">
                    {solution.bullets.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                        <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[var(--bg-secondary)] py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)]">Proof</p>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">Compliance, automation, and human-grade clarity.</h2>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
              Designed for finance and legal: defensible audit trails, programmable releases, and real-time visibility for every stakeholder.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {proofPoints.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] p-4 space-y-2">
                    <Icon className="h-5 w-5 text-[var(--color-primary)]" />
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-[0_16px_40px_rgba(0,0,0,0.08)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Live control panel</h3>
              <BadgeCheck className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Active deals</span>
                <span className="text-base font-semibold text-[var(--text-primary)]">48</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Avg. inspection window</span>
                <span className="text-base font-semibold text-[var(--text-primary)]">24h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Compliance score</span>
                <span className="text-base font-semibold text-[var(--text-primary)]">99.3%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Resolution time</span>
                <span className="text-base font-semibold text-[var(--text-primary)]">36h</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl bg-[var(--bg-tertiary)] p-3">
                <p className="text-xs text-[var(--text-secondary)]">Risk monitor</p>
                <p className="text-sm font-semibold text-[var(--color-primary)]">No anomalies</p>
              </div>
              <div className="rounded-xl bg-[var(--bg-tertiary)] p-3">
                <p className="text-xs text-[var(--text-secondary)]">Exports</p>
                <p className="text-sm font-semibold text-[var(--color-primary)]">Audit-ready</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Showcase */}
      <AppShowcase variant="solutions" />

      <section className="bg-[var(--bg-primary)] py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)]">Why teams switch</p>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">Clarsix vs legacy escrow.</h2>
            <p className="text-lg text-[var(--text-secondary)]">Modern controls, API-first, and transparent collaboration for finance, legal, buyers, and sellers.</p>
          </div>
          <div className="rounded-3xl border border-[var(--border-default)] overflow-hidden">
            <div className="grid grid-cols-3 bg-[var(--bg-tertiary)] text-xs font-semibold text-[var(--text-primary)] uppercase tracking-[0.08em]">
              <div className="px-4 py-3">Capability</div>
              <div className="px-4 py-3">Clarsix</div>
              <div className="px-4 py-3">Legacy escrow</div>
            </div>
            <div>
              {comparison.map((row) => (
                <div key={row.label} className="grid grid-cols-3 border-t border-[var(--border-default)] text-sm">
                  <div className="px-4 py-3 font-semibold text-[var(--text-primary)]">{row.label}</div>
                  <div className="px-4 py-3 text-[var(--color-primary)] font-semibold">{row.clarsix}</div>
                  <div className="px-4 py-3 text-[var(--text-secondary)]">{row.legacy}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Solutions;
