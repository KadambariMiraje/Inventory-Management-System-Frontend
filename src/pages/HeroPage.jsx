import React from 'react';
import { Link } from 'react-router-dom';
import {
  PackagePlus, ShoppingCart, Warehouse,
  AlertTriangle, Clock, IndianRupee,
  ArrowRight, BarChart3, ShieldCheck, Zap,
} from 'lucide-react';

const FEATURES = [
  {
    icon: PackagePlus,
    title: 'Add Products',
    desc: 'Register products with category, stock levels and pricing in seconds.',
  },
  {
    icon: ShoppingCart,
    title: 'Purchase & Sales',
    desc: 'Record purchases by batch and process sales — all linked to your inventory.',
  },
  {
    icon: Warehouse,
    title: 'Live Inventory',
    desc: 'See real-time stock levels across all your products at a glance.',
  },
  {
    icon: AlertTriangle,
    title: 'Low Stock Alerts',
    desc: 'Get notified when products drop below your minimum threshold.',
  },
  {
    icon: Clock,
    title: 'Expiry Tracking',
    desc: 'Monitor batch expiry dates and act before stock goes to waste.',
  },
  {
    icon: IndianRupee,
    title: 'Transaction History',
    desc: 'Full audit trail of every purchase and sale, always accessible.',
  },
];

const WHY = [
  { icon: Zap,         title: 'Fast & Simple',   desc: 'Designed for small retailers — no complex setup, start managing in minutes.' },
  { icon: ShieldCheck, title: 'Secure',           desc: 'JWT-based authentication keeps your store data safe and private.' },
  { icon: BarChart3,   title: 'Always Accurate',  desc: 'Every transaction updates inventory instantly — no manual counting.' },
];

export default function HeroPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-white pt-16 pb-24 px-6 md:px-16">

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-100/40 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-50/60 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">



          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight mb-6">
            Manage your inventory
            <span className="block text-teal-600">without the chaos.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
            IMS gives small store owners a clean, fast way to track products, purchases, sales and expiry dates — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3.5 rounded-2xl text-base transition-all shadow-xl shadow-teal-200 active:scale-95 no-underline"
            >
              Get started free
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-8 py-3.5 rounded-2xl text-base border-2 border-slate-200 transition-all active:scale-95 no-underline"
            >
              Sign in
            </Link>
          </div>

        </div>
      </section>

      {/* ── Features grid ───────────────────────────────────── */}
      <section className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">Everything you need</h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto">Powering your entire inventory workflow seamlessly</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-2xl p-6 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-600 group-hover:bg-teal-700 flex items-center justify-center mb-4 transition-colors">
                  <Icon size={18} className="text-white" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1.5">{title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why IMS ─────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-16 bg-teal-600">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">Why choose IMS?</h2>
            <p className="text-teal-200 text-sm sm:text-base max-w-md mx-auto">Built from the ground up for small retailers who need simplicity, not complexity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WHY.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-teal-200 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-16 bg-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 tracking-tight">
            Ready to take control of your inventory?
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mb-8">
            Create a free account and be up and running in minutes.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-10 py-4 rounded-2xl text-base transition-all shadow-xl shadow-teal-100 active:scale-95 no-underline"
          >
            Create free account
            <ArrowRight size={18} />
          </Link>
          <p className="text-xs text-slate-400 mt-4">No credit card required.</p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-8 px-6 md:px-16 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="IMS" className="w-6 h-6 rounded-full" />
          <span className="text-sm text-slate-400 font-medium">IMS — Inventory Management System</span>
        </div>
        <p className="text-xs text-slate-400">© 2026 IMS Portal. All rights reserved.</p>
      </footer>

    </div>
  );
}