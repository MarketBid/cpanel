import React from 'react';
import { Mail, MapPin, MessageSquare, Phone, Send, ShieldCheck, Timer } from 'lucide-react';
import PublicLayout from '../components/PublicLayout.tsx';
import Button from '../components/ui/Button';

const contactChannels = [
  {
    icon: Phone,
    label: 'Call sales',
    value: '+233 54 315 5912',
    desc: 'Mon–Sat, 8am–7pm GMT',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'r.quaicoe@clarsix.com',
    desc: 'We reply in one business day',
  },
  {
    icon: MapPin,
    label: 'Office',
    value: 'Remote-first · Accra · San Francisco',
    desc: 'Available for on-site diligence',
  },
];

const Contact: React.FC = () => {
  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-[#EEF4F2] via-white to-[#EEF4F2] py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#04805B]">Contact</p>
            <h1 className="text-4xl sm:text-5xl font-black text-[#0A1F16] leading-[1.05]">Let’s design escrow around your flow.</h1>
            <p className="text-lg text-[#4B5563] leading-relaxed">
              Tell us about your use case and we’ll share the fastest path to launch—whether it’s milestone-heavy for every project, platform payouts, or high-value asset deals.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contactChannels.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl bg-white border border-[#E6E8EA] p-4 space-y-1">
                    <div className="flex items-center gap-2 text-[#4B5563] font-semibold">
                      <Icon className="h-4 w-4 text-[#04805B]" /> {item.label}
                    </div>
                    <p className="font-bold text-[#0A1F16]">{item.value}</p>
                    <p className="text-sm text-[#6B7280]">{item.desc}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-3 text-sm text-[#0A1F16]">
              <ShieldCheck className="h-4 w-4 text-[#04805B]" />
              <span>We run identity and compliance checks for every request.</span>
            </div>
          </div>

          <div className="rounded-3xl bg-white shadow-[0_16px_40px_rgba(0,0,0,0.08)] border border-[#E6E8EA] p-6">
            <form className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[#0A1F16]">Full name</label>
                <input
                  className="mt-2 w-full rounded-xl border border-[#E6E8EA] bg-[#F5F7F7] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#04805B]"
                  placeholder="Grace Kwam"
                  required
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-[#0A1F16]">Work email</label>
                  <input
                    type="email"
                    className="mt-2 w-full rounded-xl border border-[#E6E8EA] bg-[#F5F7F7] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#04805B]"
                    placeholder="grakw@company.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#0A1F16]">Company</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-[#E6E8EA] bg-[#F5F7F7] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#04805B]"
                    placeholder="Clarsix"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0A1F16]">Use case</label>
                <textarea
                  className="mt-2 w-full rounded-xl border border-[#E6E8EA] bg-[#F5F7F7] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#04805B] min-h-[140px]"
                  placeholder="Tell us about your escrow flow, timeline, and goals."
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-[#0A1F16]">Industry</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-[#E6E8EA] bg-[#F5F7F7] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#04805B]"
                    placeholder="Fintech, construction, etc."
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#0A1F16]">Timeline</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-[#E6E8EA] bg-[#F5F7F7] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#04805B]"
                    placeholder="e.g., Go-live in 4 weeks"
                  />
                </div>
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full shadow-[0_12px_28px_rgba(4,128,91,0.35)]"
                rightIcon={<Send className="h-4 w-4" />}
              >
                Send message
              </Button>
              <p className="text-xs text-[#4B5563] text-center flex items-center justify-center gap-2">
                <Timer className="h-3 w-3" /> We reply within one business day.
              </p>
            </form>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Contact;
