"use client";

import { motion } from "framer-motion";
import { Bot, Boxes, CreditCard, Gauge, Layers, Rocket, Sparkles, Workflow } from "lucide-react";

const trustItems = ["AI-Enhanced Development", "Fast Execution", "Scalable Architecture", "Modern User Experience"];
const services = [
  "Custom Business Systems",
  "AI Automation",
  "Web & Mobile Apps",
  "SaaS MVP Development",
  "Dashboard & Admin Systems",
  "Payment & Ordering Systems",
  "Website Development",
  "Design Services",
];

const processSteps = ["Discovery", "Strategy", "Design", "Development", "Launch", "Scale"];

const pricing = [
  { title: "Starter Systems", price: "Starting from RM800" },
  { title: "Business Systems", price: "Starting from RM3,000", featured: true },
  { title: "Custom Scalable Platforms", price: "Custom quotation" },
];

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <section className="mx-auto max-w-7xl px-6 pb-16 pt-24 md:px-10 md:pt-32">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs tracking-[0.2em] text-white/80 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-blue-300" /> NEUGENS
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-7xl">We Build Intelligent Business Systems</h1>
            <p className="mt-6 max-w-2xl text-base text-zinc-300 md:text-xl">AI-enabled systems, apps, automation workflows, and digital platforms designed for modern businesses.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button className="rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-6 py-3 text-sm font-medium shadow-[0_0_40px_rgba(99,102,241,0.45)]">Discuss Your System Idea</button>
              <button className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium backdrop-blur">View Our Work</button>
            </div>
          </motion.div>
          <HeroVisual />
        </section>

        <Section title="AI-Enabled Systems & Digital Solutions">
          <div className="grid gap-4 md:grid-cols-4">
            {trustItems.map((item, i) => (
              <motion.div key={item} whileHover={{ y: -6 }} className="glass glow-card rounded-2xl p-5">
                <p className="text-sm text-zinc-300">0{i + 1}</p>
                <h3 className="mt-2 font-medium">{item}</h3>
              </motion.div>
            ))}
          </div>
        </Section>

        <Section title="What We Build">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <motion.div key={service} whileHover={{ scale: 1.02 }} className="group glow-card rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 transition">
                <div className="mb-5 h-10 w-10 rounded-lg bg-blue-500/20 p-2 text-blue-300 shadow-[0_0_30px_rgba(59,130,246,0.35)]">
                  <Boxes className="h-6 w-6" />
                </div>
                <h3 className="text-base font-medium text-zinc-100">{service}</h3>
                {service === "Design Services" && <p className="mt-1 text-xs text-zinc-400">Secondary service</p>}
              </motion.div>
            ))}
          </div>
        </Section>

        <Section title="Featured Project · BayarLink">
          <div className="grid items-center gap-8 rounded-3xl border border-violet-300/20 bg-white/[0.03] p-6 shadow-[0_0_70px_rgba(124,58,237,0.2)] md:grid-cols-2 md:p-10">
            <div>
              <p className="text-zinc-300">An AI-enabled ordering and payment ecosystem built for modern businesses and home-based sellers.</p>
              <div className="mt-7 flex gap-3">
                <button className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black">Explore Platform</button>
                <button className="rounded-full border border-white/20 px-5 py-3 text-sm">Live Demo</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[[CreditCard, "Payment UI"], [Gauge, "Dashboard UI"], [Bot, "Mobile ordering screen"], [Layers, "Analytics cards"]].map(([Icon, label], i) => (
                <motion.div key={label as string} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2.8 + i }} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <Icon className="h-5 w-5 text-blue-300" />
                  <p className="mt-3 text-sm">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Process">
          <div className="grid gap-4 md:grid-cols-6">
            {processSteps.map((step, i) => (
              <motion.div key={step} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-zinc-400">Step {i + 1}</p>
                <p className="mt-1 font-medium">{step}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        <Section title="Pricing">
          <div className="grid gap-4 md:grid-cols-3">
            {pricing.map((item) => (
              <div key={item.title} className={`rounded-2xl border p-6 ${item.featured ? "border-violet-300/50 bg-violet-500/10" : "border-white/10 bg-white/[0.03]"}`}>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-zinc-300">{item.price}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-zinc-400">Flexible payment and installment options available.</p>
        </Section>

        <section className="mx-auto max-w-7xl px-6 pb-20 md:px-10">
          <div className="rounded-3xl border border-blue-300/20 bg-gradient-to-r from-blue-500/15 to-violet-500/15 p-10 text-center shadow-[0_0_80px_rgba(99,102,241,0.25)]">
            <h2 className="text-3xl font-semibold md:text-5xl">Have a system idea?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-300">Tell us your business problem. We’ll help propose the right digital solution.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black">Get Free Consultation</button>
              <button className="rounded-full border border-white/20 px-6 py-3 text-sm">WhatsApp Us</button>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 px-6 py-10 md:px-10">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 md:flex-row">
            <div>
              <p className="text-lg font-semibold">NEUGENS</p>
              <p className="text-sm text-zinc-400">AI-Enabled Systems & Digital Solutions</p>
            </div>
            <div className="flex gap-6 text-sm text-zinc-300">
              <a href="#">WhatsApp</a><a href="#">Email</a><a href="#">Social</a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
      <h2 className="mb-8 text-2xl font-semibold md:text-4xl">{title}</h2>
      {children}
    </section>
  );
}

function HeroVisual() {
  return (
    <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass mt-14 rounded-3xl p-4 md:p-8">
      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard icon={<Workflow className="h-5 w-5 text-blue-300" />} title="Automation Flow" value="24 active" />
        <GlassCard icon={<Bot className="h-5 w-5 text-violet-300" />} title="AI Assist" value="98.2% uptime" />
        <GlassCard icon={<Rocket className="h-5 w-5 text-cyan-300" />} title="Deploy Velocity" value="+41% faster" />
      </div>
    </motion.div>
  );
}

function GlassCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      {icon}
      <p className="mt-4 text-sm text-zinc-300">{title}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

function AnimatedBackground() {
  return (
    <>
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <motion.div className="pointer-events-none absolute -left-24 top-20 h-80 w-80 rounded-full bg-blue-500/20 blur-[120px]" animate={{ x: [0, 80, 0], y: [0, 40, 0] }} transition={{ duration: 12, repeat: Infinity }} />
      <motion.div className="pointer-events-none absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-violet-500/20 blur-[140px]" animate={{ x: [0, -70, 0], y: [0, -30, 0] }} transition={{ duration: 14, repeat: Infinity }} />
      <motion.div className="pointer-events-none absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-cyan-400/10 blur-[120px]" animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 4, repeat: Infinity }} />
    </>
  );
}
