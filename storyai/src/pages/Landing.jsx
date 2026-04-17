import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Wand2, Film, ShieldCheck, Menu, X, Check, Zap, Presentation, LogOut, PlayCircle } from 'lucide-react';
import { StoryAILogo } from '../components/StoryAILogo';

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white border border-[#E0E0E0] rounded-3xl p-8 shadow-sm hover:shadow-lg hover:border-[#F27D16] transition-all duration-300 group">
      <div className="w-14 h-14 rounded-2xl bg-[#F27D16]/10 text-[#F27D16] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {React.createElement(icon, { size: 24 })}
      </div>
      <div className="font-heading font-black text-lg text-[#032940] mb-3">{title}</div>
      <div className="text-sm text-[#666666] font-semibold leading-relaxed">{description}</div>
    </div>
  );
}

function PricingCard({ tier, price, description, features, featured = false }) {
  return (
    <div className={`relative rounded-3xl p-8 border-2 flex flex-col transition-all duration-300 ${
      featured 
        ? 'bg-[#032940] border-[#032940] text-white shadow-2xl scale-105 z-10' 
        : 'bg-white border-[#E0E0E0] text-[#032940] hover:border-[#F27D16] hover:shadow-lg'
    }`}>
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#F27D16] text-[#032940] rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-black mb-2 italic">{tier}</h3>
      <p className={`text-xs font-bold uppercase tracking-widest mb-6 ${featured ? 'text-[#F27D16]' : 'text-[#999999]'}`}>
        {description}
      </p>
      <div className="flex items-baseline gap-2 mb-8">
        <span className="text-4xl font-black">{price}</span>
        <span className="text-xs font-bold uppercase tracking-wider text-[#999999]">/mo</span>
      </div>
      <ul className="flex-1 space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm font-semibold">
            <Check size={18} className={featured ? 'text-[#F27D16]' : 'text-[#F27D16]'} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/login"
        className={`py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-colors text-center ${
          featured
            ? 'bg-[#F27D16] text-[#032940] hover:bg-white'
            : 'bg-[#032940] text-white hover:bg-[#F27D16] hover:text-[#032940]'
        }`}
      >
        Get Started
      </Link>
    </div>
  );
}

export function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#333333] font-body">
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg border-b border-[#E0E0E0]' : 'bg-white border-b border-[#E0E0E0]'}`}>
        <div className="max-w-7xl mx-auto px-5 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StoryAILogo className="w-12 h-12" />
            <div>
              <div className="font-heading font-black text-2xl text-[#032940] uppercase leading-none">
                StoryAI
              </div>
              <div className="text-xs text-[#F27D16] font-bold tracking-widest uppercase">
                Creative Studio
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <nav className="flex gap-8 text-sm font-bold text-[#666666]">
              <a href="#features" className="hover:text-[#F27D16] transition-colors">Features</a>
              <a href="#how" className="hover:text-[#F27D16] transition-colors">How It Works</a>
              <a href="#pricing" className="hover:text-[#F27D16] transition-colors">Pricing</a>
            </nav>
            <div className="flex items-center gap-3 border-l border-[#E0E0E0] pl-8">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-black text-[#032940] hover:text-[#F27D16] transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-black text-white bg-[#032940] hover:bg-[#F27D16] hover:text-[#032940] transition-colors flex items-center gap-2"
              >
                Get started <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#E0E0E0] p-5">
            <nav className="flex flex-col gap-4 mb-4">
              <a href="#features" className="text-sm font-bold text-[#666666] hover:text-[#F27D16]">Features</a>
              <a href="#how" className="text-sm font-bold text-[#666666] hover:text-[#F27D16]">How It Works</a>
              <a href="#pricing" className="text-sm font-bold text-[#666666] hover:text-[#F27D16]">Pricing</a>
            </nav>
            <div className="flex flex-col gap-2 border-t border-[#E0E0E0] pt-4">
              <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-black text-[#032940] text-center">Sign in</Link>
              <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-black text-white bg-[#032940] text-center">Get started</Link>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-5 py-14">
        <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E0E0E0] text-xs font-black text-[#032940] tracking-widest uppercase">
              <Sparkles size={14} className="text-[#F27D16]" />
              Storyboards, faster
            </div>
            <h1 className="mt-5 font-heading font-black text-4xl sm:text-5xl text-[#032940] leading-tight">
              Turn scripts into professional storyboards with AI—without losing creative control.
            </h1>
            <p className="mt-4 text-[#555555] font-semibold text-lg leading-relaxed max-w-2xl">
              Paste a script, auto-parse into shots, generate frames, and refine each shot with cinema
              parameters, notes, and takes—like a real production workflow.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                to="/login"
                className="px-5 py-3 rounded-2xl text-sm font-black text-white bg-[#F27D16] hover:bg-[#d86b10] transition-colors inline-flex items-center justify-center gap-2 shadow-md shadow-[#F27D16]/20"
              >
                Start creating <ArrowRight size={16} />
              </Link>
              <a
                href="#how"
                className="px-5 py-3 rounded-2xl text-sm font-black text-[#032940] bg-white border border-[#E0E0E0] hover:border-[#032940] transition-colors inline-flex items-center justify-center"
              >
                How it works
              </a>
            </div>
          </div>

          <div className="bg-white border border-[#E0E0E0] rounded-3xl p-6 shadow-sm">
            <div className="font-heading font-black text-[#032940] text-lg">Studio preview</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="aspect-video rounded-2xl bg-[#F0F0F0] border border-[#E0E0E0]" />
              <div className="aspect-video rounded-2xl bg-[#F0F0F0] border border-[#E0E0E0]" />
              <div className="aspect-video rounded-2xl bg-[#F0F0F0] border border-[#E0E0E0]" />
              <div className="aspect-video rounded-2xl bg-[#F0F0F0] border border-[#E0E0E0]" />
            </div>
            <div className="mt-4 text-xs text-[#555555] font-semibold leading-relaxed">
              Parse a script into shots, then generate frames and keep the best “take” per shot.
            </div>
          </div>
        </section>

        <section id="how" className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Feature icon={Wand2} title="Script → Shots">
            Auto-parse scripts into storyboard-ready shots with captions and prompts.
          </Feature>
          <Feature icon={Film} title="Cinema controls">
            Shot size, lens, angle, lighting presets, notes, and per-shot takes.
          </Feature>
          <Feature icon={Sparkles} title="AI image generation">
            Generate frames per shot, batch-generate selections, and retry failed jobs.
          </Feature>
          <Feature icon={ShieldCheck} title="Studio + admin ready">
            Creator profiles, project management, and an admin surface for oversight.
          </Feature>
        </section>

        <section className="mt-14 bg-gradient-to-br from-white to-[#F0F0F0] border border-[#E0E0E0] rounded-3xl p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="font-heading font-black text-2xl text-[#032940]">
                Ready to build your storyboard?
              </div>
              <div className="text-[#555555] font-semibold mt-2">
                Sign in or create an account to start a new project.
              </div>
            </div>
            <Link
              to="/login"
              className="px-6 py-3 rounded-2xl text-sm font-black text-white bg-[#032940] hover:bg-[#021B2B] transition-colors inline-flex items-center justify-center gap-2"
            >
              Open Studio <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

