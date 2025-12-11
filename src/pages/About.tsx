import React from 'react';
import { Award, Compass, HeartHandshake, Shield, Users } from 'lucide-react';
import PublicLayout from '../components/PublicLayout.tsx';

const values = [
  {
    title: 'Trust first',
    icon: Shield,
    description: 'We design everything to earn trust: clear rules, transparent status, and auditable trails.',
  },
  {
    title: 'Guided by outcomes',
    icon: Compass,
    description: 'We obsess over completed, dispute-free transactions that make both sides successful.',
  },
  {
    title: 'Humans in the loop',
    icon: HeartHandshake,
    description: 'Automation where it helps, specialists when you need a neutral voice to mediate.',
  },
  {
    title: 'Security as a default',
    icon: Award,
    description: 'Bank-grade practices, continuous monitoring, and layered controls across the stack.',
  },
];

const About: React.FC = () => {
  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-[#EEF1F8] to-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#635BFF]">About us</p>
            <h1 className="text-4xl sm:text-5xl font-black text-[#0A2540] leading-[1.05]">Building the trust layer for modern commerce.</h1>
            <p className="text-lg text-[#425466] leading-relaxed">
              Clarsix is an escrow payment platform crafted for teams that need certainty. We secure funds, structure
              releases, and provide clarity so buyers and sellers can move quickly without sacrificing safety.
            </p>
          </div>
          <div className="rounded-3xl bg-white shadow-xl border border-[#E3E8EE] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#425466] font-semibold uppercase">Founded</p>
                <p className="text-2xl font-black text-[#0A2540]">2022</p>
              </div>
              <div>
                <p className="text-sm text-[#425466] font-semibold uppercase">Team</p>
                <p className="text-2xl font-black text-[#0A2540]">38 people</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#425466] font-semibold uppercase">Transactions</p>
                <p className="text-2xl font-black text-[#0A2540]">1.2M+</p>
              </div>
              <div>
                <p className="text-sm text-[#425466] font-semibold uppercase">Resolution rate</p>
                <p className="text-2xl font-black text-[#0A2540]">97%</p>
              </div>
            </div>
            <div className="rounded-2xl bg-[#F7F9FC] border border-[#E3E8EE] p-4 text-sm text-[#425466] leading-relaxed">
              We partner with compliance experts, payment processors, and financial institutions to bring the safest escrow
              experience to freelancers, businesses, and platforms worldwide.
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10 space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#635BFF]">Values</p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0A2540]">Principles that shape every feature we ship.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="rounded-2xl border border-[#E3E8EE] bg-[#F7F9FC] p-6 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#0A2540] border border-[#E3E8EE] text-xs font-semibold">
                    <Icon className="h-4 w-4" />
                    {value.title}
                  </div>
                  <p className="text-sm text-[#425466] leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#0A2540] text-white py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/70">Our promise</p>
          <h3 className="text-3xl sm:text-4xl font-black">Escrow without friction, support without scripts.</h3>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            We combine automation with a human team that answers, explains, and steps in when your deal needs it most.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-semibold">
            <Users className="h-4 w-4" /> Dedicated success for every customer
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default About;
