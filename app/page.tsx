"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
} from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

/* ================================================================
   DATA
   ================================================================ */

const STATS = [
  { label: "Kasus Dilaporkan", value: 2847, suffix: "+", icon: "📋" },
  { label: "Dana Terkumpul", value: 4.2, suffix: " M", prefix: "Rp", icon: "💰" },
  { label: "Kasus Tertangani", value: 1923, suffix: "+", icon: "✅" },
  { label: "Donatur Aktif", value: 12450, suffix: "+", icon: "❤️" },
];

const STEPS = [
  {
    step: 1,
    title: "Laporkan",
    desc: "Buat laporan kasus anak terlantar atau kekerasan. Bisa anonim.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  {
    step: 2,
    title: "Verifikasi AI",
    desc: "AI menganalisis urgency level dan merekomendasikan tindakan.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
  },
  {
    step: 3,
    title: "Ditangani",
    desc: "Tim & lembaga terkait menindaklanjuti hingga kasus terselesaikan.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
];

const PROGRAMS = [
  {
    id: 1,
    title: "Rumah Aman untuk Anak Jalanan",
    desc: "Menyediakan tempat tinggal, makanan, dan pendidikan bagi anak-anak jalanan di 5 kota besar.",
    image: "🏠",
    target: 500000000,
    current: 372500000,
    donors: 1247,
  },
  {
    id: 2,
    title: "Perlindungan Kekerasan Digital",
    desc: "Program literasi digital & pendampingan anak korban cyberbullying dan eksploitasi online.",
    image: "🛡️",
    target: 200000000,
    current: 145000000,
    donors: 832,
  },
  {
    id: 3,
    title: "Beasiswa Anak Korban Kekerasan",
    desc: "Beasiswa pendidikan dan konseling psikologis untuk anak-anak korban kekerasan dalam rumah tangga.",
    image: "🎓",
    target: 350000000,
    current: 198000000,
    donors: 956,
  },
];

const FUND_DATA = [
  { name: "Program Anak", value: 45, color: "#0D9488" },
  { name: "Operasional", value: 15, color: "#0F172A" },
  { name: "Pendidikan", value: 20, color: "#2dd4bf" },
  { name: "Darurat", value: 12, color: "#F97316" },
  { name: "Pengembangan", value: 8, color: "#3b72f9" },
];

const TESTIMONIALS = [
  {
    id: 1,
    quote: "Dulu saya takut pergi ke sekolah. Sekarang, berkat PeduliAnak, saya punya rumah yang aman dan bisa belajar dengan tenang. Terima kasih untuk semua yang sudah membantu.",
    name: "Rina",
    age: 13,
    location: "Jakarta",
  },
  {
    id: 2,
    quote: "Saya pernah di-bully di internet dan tidak tahu harus berbicara dengan siapa. PeduliAnak membantu saya mendapat konseling dan sekarang saya lebih berani.",
    name: "Adi",
    age: 15,
    location: "Surabaya",
  },
  {
    id: 3,
    quote: "Program beasiswa dari PeduliAnak membuat saya bisa melanjutkan sekolah. Saya ingin jadi dokter agar bisa membantu anak-anak lain seperti saya.",
    name: "Siti",
    age: 14,
    location: "Bandung",
  },
  {
    id: 4,
    quote: "Setelah dilaporkan ke PeduliAnak, saya akhirnya mendapat perlindungan. Sekarang saya tinggal di tempat yang aman dan bisa bermain dengan teman-teman baru.",
    name: "Budi",
    age: 11,
    location: "Yogyakarta",
  },
];

/* ================================================================
   ANIMATED COUNTER HOOK
   ================================================================ */

function AnimatedCounter({
  target,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 2,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    if (decimals > 0) return v.toFixed(decimals);
    return Math.floor(v).toLocaleString("id-ID");
  });
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      animate(count, target, { duration, ease: "easeOut" });
    }
  }, [isInView, target, count, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

/* ================================================================
   SECTION ANIMATION WRAPPER
   ================================================================ */

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ================================================================
   NAVBAR
   ================================================================ */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-soft border-b border-warm-200/50"
          : "bg-transparent"
      }`}
    >
      <div className="section-container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-heading font-bold text-sm transition-colors ${scrolled ? 'bg-navy-800 text-white' : 'bg-white/10 text-white border border-white/20'}`}>
            PA
          </div>
          <span className={`text-lg font-heading font-bold transition-colors ${scrolled ? 'text-navy-800' : 'text-white'}`}>
            Peduli<span className="text-teal-500">Anak</span>
          </span>
        </a>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {["Beranda", "Laporan", "Donasi", "Program", "Tentang"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className={`text-sm font-medium transition-colors hover:text-teal-500 ${
                scrolled ? "text-navy-800/70" : "text-white/70"
              }`}
            >
              {item}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant={scrolled ? "outline" : "ghost-light"} size="sm" className="hidden sm:flex">
            Masuk
          </Button>
          <Button variant="accent" size="sm">
            Laporkan
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}

/* ================================================================
   1. HERO SECTION
   ================================================================ */

function HeroSection() {
  return (
    <section id="beranda" className="relative min-h-screen flex items-center bg-gradient-hero-mesh noise-overlay overflow-hidden">
      {/* Animated Mesh Orbs */}
      <div className="mesh-orb mesh-orb-1" />
      <div className="mesh-orb mesh-orb-2" />
      <div className="mesh-orb mesh-orb-3" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="section-container relative z-10 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Badge variant="teal" className="mb-6 bg-teal-500/10 border-teal-500/20 text-teal-300 px-4 py-1.5 text-xs">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
              </span>
              Platform Perlindungan Anak #1 di Indonesia
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-[1.1] mb-6"
          >
            Setiap Anak Berhak{" "}
            <span className="text-gradient-teal">Merasa Aman</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-base sm:text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Laporkan kasus kekerasan & anak terlantar. Donasi untuk masa depan mereka.
            Bersama kita lindungi generasi penerus Indonesia.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button variant="coral" size="xl" className="w-full sm:w-auto group">
              <svg className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Laporkan Kasus
            </Button>
            <Button variant="outline-teal" size="xl" className="w-full sm:w-auto border-teal-400/30 text-teal-300 hover:bg-teal-500 hover:text-white hover:border-teal-500">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              Donasi Sekarang
            </Button>
          </motion.div>

          {/* Mini stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto"
          >
            {STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-heading font-bold text-white">
                  <AnimatedCounter
                    target={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.value < 100 ? 1 : 0}
                    duration={2.5}
                  />
                </div>
                <div className="text-xs md:text-sm text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-warm-50 to-transparent" />
    </section>
  );
}

/* ================================================================
   2. STATS BAR
   ================================================================ */

function StatsBar() {
  return (
    <section className="relative -mt-8 z-20">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="section-container"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeUpItem}
              className="bg-white rounded-2xl p-6 shadow-soft border border-warm-200/50 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">{stat.icon}</div>
              <div className="text-2xl md:text-3xl font-heading font-bold text-navy-800">
                <AnimatedCounter
                  target={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.value < 100 ? 1 : 0}
                />
              </div>
              <div className="text-sm text-navy-800/50 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ================================================================
   3. HOW IT WORKS
   ================================================================ */

function HowItWorks() {
  return (
    <section id="cara-kerja" className="section-padding bg-warm-50">
      <div className="section-container">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <Badge variant="teal" className="mb-4">Cara Kerja</Badge>
          <h2 className="section-heading">
            Tiga Langkah <span className="text-gradient-teal">Sederhana</span>
          </h2>
          <p className="section-subheading mx-auto mt-4">
            Kami mempermudah proses pelaporan dan penanganan kasus anak dengan teknologi AI.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="relative"
        >
          {/* Timeline connector */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-200 to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {STEPS.map((step, i) => (
              <motion.div key={i} variants={fadeUpItem} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-card border border-warm-200/50 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 text-center group">
                  {/* Step number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-glow z-10">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto mb-6 mt-2 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                    {step.icon}
                  </div>

                  <h3 className="text-xl font-heading font-bold text-navy-800 mb-3">{step.title}</h3>
                  <p className="text-navy-800/50 text-sm leading-relaxed">{step.desc}</p>
                </div>

                {/* Arrow between steps (desktop) */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-6 -translate-y-1/2 text-teal-300 z-10">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.22 19.03a.75.75 0 0 1 0-1.06L18.19 13H3.75a.75.75 0 0 1 0-1.5h14.44l-4.97-4.97a.75.75 0 0 1 1.06-1.06l6.25 6.25a.75.75 0 0 1 0 1.06l-6.25 6.25a.75.75 0 0 1-1.06 0Z" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ================================================================
   4. PROGRAM CARDS
   ================================================================ */

function formatRupiah(n: number) {
  if (n >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toFixed(1)} M`;
  if (n >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(0)} Jt`;
  return `Rp${n.toLocaleString("id-ID")}`;
}

function ProgramCards() {
  return (
    <section id="program" className="section-padding bg-gradient-section">
      <div className="section-container">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <Badge variant="coral" className="mb-4">Program Aktif</Badge>
          <h2 className="section-heading">
            Bantu Melalui <span className="text-gradient-teal">Program Kami</span>
          </h2>
          <p className="section-subheading mx-auto mt-4">
            Setiap donasi Anda langsung disalurkan ke program perlindungan anak yang transparan.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {PROGRAMS.map((program) => {
            const percent = Math.round((program.current / program.target) * 100);

            return (
              <motion.div
                key={program.id}
                variants={fadeUpItem}
                className="bg-white rounded-2xl overflow-hidden shadow-card border border-warm-200/50 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* Image area */}
                <div className="h-48 bg-gradient-to-br from-navy-800 to-teal-800 flex items-center justify-center relative overflow-hidden">
                  <div className="text-6xl group-hover:scale-110 transition-transform duration-500">
                    {program.image}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <Badge variant="teal" className="absolute top-4 right-4 bg-teal-500/20 border-teal-500/30 text-teal-200">
                    Aktif
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-heading font-bold text-navy-800 mb-2 line-clamp-1 group-hover:text-teal-600 transition-colors">
                    {program.title}
                  </h3>
                  <p className="text-sm text-navy-800/50 mb-5 line-clamp-2 leading-relaxed">
                    {program.desc}
                  </p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-navy-800">{formatRupiah(program.current)}</span>
                      <span className="text-navy-800/40">dari {formatRupiah(program.target)}</span>
                    </div>
                    <div className="h-2.5 bg-warm-100 rounded-full overflow-hidden">
                      <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percent}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-teal-600 font-medium">{percent}% tercapai</span>
                      <span className="text-xs text-navy-800/40">{program.donors} donatur</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button variant="accent" className="w-full" size="md">
                    Donasi Program Ini
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ================================================================
   5. TRANSPARANSI (PIE CHART)
   ================================================================ */

function TransparansiSection() {
  return (
    <section id="transparansi" className="section-padding bg-white">
      <div className="section-container">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <Badge variant="info" className="mb-4">Transparansi Dana</Badge>
              <h2 className="section-heading mb-6">
                Anda Tahu Persis{" "}
                <span className="text-gradient-teal">Ke Mana Dana Pergi</span>
              </h2>
              <p className="text-navy-800/50 text-lg leading-relaxed mb-8">
                Kami berkomitmen penuh pada transparansi. Setiap rupiah donasi Anda
                dicatat dan dilaporkan secara real-time. Mayoritas dana langsung
                digunakan untuk program perlindungan anak.
              </p>

              {/* Legend */}
              <div className="space-y-3">
                {FUND_DATA.map((item) => (
                  <div key={item.name} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full transition-transform group-hover:scale-125"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-navy-800/70">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-navy-800">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <div className="aspect-square max-w-md mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={FUND_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius="55%"
                      outerRadius="85%"
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {FUND_DATA.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0F172A",
                        border: "none",
                        borderRadius: "12px",
                        color: "white",
                        fontSize: "13px",
                        padding: "8px 14px",
                      }}
                      formatter={(value: number) => [`${value}%`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl md:text-4xl font-heading font-bold text-navy-800">85%</span>
                  <span className="text-sm text-navy-800/40">Langsung ke Anak</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ================================================================
   6. TESTIMONIALS CAROUSEL
   ================================================================ */

function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="section-padding bg-gradient-cta noise-overlay relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-teal-500/10 blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-navy-400/10 blur-[120px]" />

      <div className="section-container relative z-10">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <Badge variant="teal" className="mb-4 bg-teal-500/10 border-teal-500/20 text-teal-300">
            Cerita Mereka
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white">
            Suara Anak-Anak yang{" "}
            <span className="text-gradient-teal">Terbantu</span>
          </h2>
        </motion.div>

        {/* Carousel */}
        <div className="max-w-3xl mx-auto relative">
          <div className="min-h-[240px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                <div className="glass rounded-3xl p-8 md:p-10 text-center">
                  {/* Quote icon */}
                  <svg className="w-10 h-10 text-teal-400/40 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017ZM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0Z" />
                  </svg>

                  <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 italic">
                    &ldquo;{TESTIMONIALS[current].quote}&rdquo;
                  </p>

                  <div>
                    <div className="text-white font-semibold">
                      {TESTIMONIALS[current].name}, {TESTIMONIALS[current].age} tahun
                    </div>
                    <div className="text-white/40 text-sm">
                      {TESTIMONIALS[current].location}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-8 bg-teal-400"
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Lihat testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   7. FOOTER
   ================================================================ */

function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-navy-950 text-white/60 pt-20 pb-8">
      <div className="section-container">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <motion.div variants={fadeUpItem} className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white font-heading font-bold text-sm">
                  PA
                </div>
                <span className="text-xl font-heading font-bold text-white">
                  Peduli<span className="text-teal-400">Anak</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                Platform donasi dan pelaporan kasus anak terlantar & kekerasan digital.
                Bersama lindungi masa depan anak Indonesia.
              </p>
              {/* Social links */}
              <div className="flex gap-3">
                {[
                  { name: "Twitter", path: "M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0 0 22 5.92a8.19 8.19 0 0 1-2.357.646 4.118 4.118 0 0 0 1.804-2.27 8.224 8.224 0 0 1-2.605.996 4.107 4.107 0 0 0-6.993 3.743 11.65 11.65 0 0 1-8.457-4.287 4.106 4.106 0 0 0 1.27 5.477A4.072 4.072 0 0 1 2.8 9.713v.052a4.105 4.105 0 0 0 3.292 4.022 4.095 4.095 0 0 1-1.853.07 4.108 4.108 0 0 0 3.834 2.85A8.233 8.233 0 0 1 2 18.407a11.616 11.616 0 0 0 6.29 1.84" },
                  { name: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" },
                  { name: "YouTube", path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" },
                ].map(({ name, path }) => (
                  <a
                    key={name}
                    href="#"
                    aria-label={name}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-teal-500 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <svg className="w-4 h-4 fill-current text-white/40 group-hover:text-white" viewBox="0 0 24 24">
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Quick links */}
            <motion.div variants={fadeUpItem}>
              <h4 className="text-white font-heading font-semibold mb-4">Navigasi</h4>
              <ul className="space-y-3 text-sm">
                {["Beranda", "Laporan Kasus", "Donasi", "Program", "Tentang Kami"].map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-teal-400 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Legal */}
            <motion.div variants={fadeUpItem}>
              <h4 className="text-white font-heading font-semibold mb-4">Informasi</h4>
              <ul className="space-y-3 text-sm">
                {["Kebijakan Privasi", "Syarat & Ketentuan", "FAQ", "Kontak Kami", "Karir"].map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-teal-400 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Newsletter */}
            <motion.div variants={fadeUpItem}>
              <h4 className="text-white font-heading font-semibold mb-4">Newsletter</h4>
              <p className="text-sm mb-4">Dapatkan update terbaru tentang program perlindungan anak.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Anda"
                  className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 focus:outline-none transition-colors"
                />
                <Button variant="accent" size="sm" className="shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                </Button>
              </div>

              {/* Address */}
              <div className="mt-6 pt-6 border-t border-white/5">
                <h4 className="text-white font-heading font-semibold mb-2 text-sm">Kantor</h4>
                <p className="text-xs leading-relaxed">
                  Jl. Perlindungan Anak No. 45<br />
                  Jakarta Selatan 12130<br />
                  Indonesia
                </p>
                <p className="text-xs mt-2">
                  📧 info@pedulianak.id<br />
                  📞 (021) 555-0123
                </p>
              </div>
            </motion.div>
          </div>

          {/* Bottom bar */}
          <motion.div
            variants={fadeUpItem}
            className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <p className="text-xs text-white/30">
              © 2026 PeduliAnak. Seluruh hak dilindungi.
            </p>
            <p className="text-xs text-white/30">
              Dibuat dengan ❤️ untuk masa depan anak Indonesia
            </p>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}

/* ================================================================
   MAIN PAGE
   ================================================================ */

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <HowItWorks />
        <ProgramCards />
        <TransparansiSection />
        <TestimonialCarousel />
      </main>
      <Footer />
    </>
  );
}
