import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Wand2, Film, ShieldCheck, Menu, X, Check, Zap, Presentation, LogOut, PlayCircle } from 'lucide-react';
import { StoryAILogo } from '../components/StoryAILogo';

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white border border-[#E0E0E0] rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:border-[#F27D16] hover:-translate-y-1 transition-all duration-300 group">
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
    <div
      className={`relative rounded-3xl p-8 border-2 flex flex-col transition-all duration-300 ${
        featured
          ? 'bg-[#032940] border-[#032940] text-white shadow-2xl scale-105 z-10'
          : 'bg-white border-[#E0E0E0] text-[#032940] hover:border-[#F27D16] hover:shadow-lg'
      }`}
    >
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
        className={`py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-200 text-center hover:shadow-lg hover:scale-105 ${
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
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-sm ${scrolled ? 'bg-white/95 shadow-xl border-b border-[#E0E0E0]/50' : 'bg-white/90 border-b border-[#E0E0E0]/30'}`}>
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
              <a href="#features" className="hover:text-[#F27D16] transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#F27D16] after:transition-all after:duration-300 hover:after:w-full">Features</a>
              <a href="#how" className="hover:text-[#F27D16] transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#F27D16] after:transition-all after:duration-300 hover:after:w-full">How It Works</a>
              <a href="#pricing" className="hover:text-[#F27D16] transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#F27D16] after:transition-all after:duration-300 hover:after:w-full">Pricing</a>
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
                className="px-4 py-2 rounded-xl text-sm font-black text-white bg-[#032940] hover:bg-[#F27D16] hover:text-[#032940] hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                Get started <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 rounded-lg hover:bg-[#F0F0F0] transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#E0E0E0] p-5 animate-in fade-in slide-in-from-top-2 duration-200">    
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

      <main className="pt-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-5 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E0E0E0] text-xs font-black text-[#032940] tracking-widest uppercase">
                <Sparkles size={14} className="text-[#F27D16]" />
                AI-Powered Storyboards
              </div>
              <h1 className="mt-8 font-heading font-black text-5xl lg:text-6xl text-[#032940] leading-tight">
                Create Professional Storyboards in Minutes
              </h1>
              <p className="mt-6 text-[#555555] font-semibold text-lg leading-relaxed max-w-2xl">
                Transform your scripts into stunning visual storyboards with AI-powered automation. Keep creative control with every shot.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/login"
                  className="px-6 py-4 rounded-2xl text-base font-black text-white bg-[#F27D16] hover:bg-[#d86b10] hover:shadow-xl hover:scale-105 transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-lg shadow-[#F27D16]/30"
                >
                  Start Creating <ArrowRight size={18} />
                </Link>
                <a
                  href="#how"
                  className="px-6 py-4 rounded-2xl text-base font-black text-[#032940] bg-white border-2 border-[#E0E0E0] hover:border-[#F27D16] hover:shadow-lg hover:bg-[#F0F0F0] transition-all duration-200 inline-flex items-center justify-center"
                >
                  See How It Works
                </a>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#F27D16]/8 to-[#032940]/8 border border-[#E0E0E0] rounded-3xl p-8 shadow-lg hover:shadow-2xl hover:border-[#F27D16]/50 transition-all duration-300">
              <div className="font-heading font-black text-[#032940] text-xl mb-6">Studio Preview</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-video rounded-2xl bg-[#F0F0F0] border border-[#E0E0E0] flex items-center justify-center">
                  <PlayCircle size={40} className="text-[#F27D16]/30" />
                </div>
                <div className="aspect-video rounded-2xl bg-[#F0F0F0] border border-[#E0E0E0] flex items-center justify-center">
                  <PlayCircle size={40} className="text-[#F27D16]/30" />
                </div>
                <div className="aspect-video rounded-2xl bg-[#F0F0F0] border border-[#E0E0E0] flex items-center justify-center">
                  <PlayCircle size={40} className="text-[#F27D16]/30" />
                </div>
                <div className="aspect-video rounded-2xl bg-[#F0F0F0] border border-[#E0E0E0] flex items-center justify-center">
                  <PlayCircle size={40} className="text-[#F27D16]/30" />
                </div>
              </div>
              <div className="mt-6 text-sm text-[#555555] font-semibold leading-relaxed">
                Upload your script, auto-parse shots, and generate beautiful frames with AI.
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-5 py-24 lg:py-32">
          <div className="text-center mb-16">
            <h2 className="font-heading font-black text-4xl text-[#032940] mb-4">Powerful Features for Creators</h2>
            <p className="text-[#666666] font-semibold text-lg max-w-2xl mx-auto">Everything you need to create professional storyboards with AI assistance</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={Wand2} 
              title="Script to Shots" 
              description="Automatically parse scripts into storyboard-ready shots with intelligent shot detection." 
            />
            <FeatureCard 
              icon={Film} 
              title="Cinema Controls" 
              description="Fine-tune every shot with lens, angle, lighting presets, and detailed production notes." 
            />
            <FeatureCard 
              icon={Sparkles} 
              title="AI Generation" 
              description="Generate stunning frames per shot with batch processing and unlimited retries." 
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Team Ready" 
              description="Creator profiles, project management, and admin controls for seamless collaboration." 
            />
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how" className="max-w-7xl mx-auto px-5 py-24 lg:py-32 bg-gradient-to-b from-[#F9F9F9] to-white -mx-5 px-[calc(1.25rem)] lg:-mx-0 lg:px-5 rounded-none lg:rounded-3xl">
          <div className="text-center mb-16">
            <h2 className="font-heading font-black text-4xl text-[#032940] mb-4">How It Works</h2>
            <p className="text-[#666666] font-semibold text-lg max-w-2xl mx-auto">Three simple steps to create your first storyboard</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-[#E0E0E0] shadow-sm hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-full bg-[#F27D16] text-white flex items-center justify-center font-heading font-black text-xl mb-6">
                1
              </div>
              <h3 className="font-heading font-black text-xl text-[#032940] mb-3">Upload Your Script</h3>
              <p className="text-[#666666] font-semibold leading-relaxed">
                Paste your screenplay or script. Our AI automatically detects scenes, shots, and action.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-[#E0E0E0] shadow-sm hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-full bg-[#F27D16] text-white flex items-center justify-center font-heading font-black text-xl mb-6">
                2
              </div>
              <h3 className="font-heading font-black text-xl text-[#032940] mb-3">Customize Shots</h3>
              <p className="text-[#666666] font-semibold leading-relaxed">
                Edit shot descriptions, add cinematography details, adjust timing, and add production notes.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-[#E0E0E0] shadow-sm hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-full bg-[#F27D16] text-white flex items-center justify-center font-heading font-black text-xl mb-6">
                3
              </div>
              <h3 className="font-heading font-black text-xl text-[#032940] mb-3">Generate & Share</h3>
              <p className="text-[#666666] font-semibold leading-relaxed">
                Generate frames with AI, select your favorite takes, and share polished storyboards with your team.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="max-w-7xl mx-auto px-5 py-24 lg:py-32">
          <div className="text-center mb-16">
            <h2 className="font-heading font-black text-4xl text-[#032940] mb-4">Simple, Transparent Pricing</h2>
            <p className="text-[#666666] font-semibold text-lg max-w-2xl mx-auto">Choose the perfect plan for your creative needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            <PricingCard
              tier="Starter"
              price="Free"
              description="Perfect to get started"
              features={[
                "5 projects per month",
                "Up to 50 shots per project",
                "Basic AI image generation",
                "Standard support",
                "Export to PDF"
              ]}
            />
            <PricingCard
              tier="Creator"
              price="$19"
              description="For active creators"
              features={[
                "Unlimited projects",
                "Up to 500 shots per project",
                "Advanced AI generation",
                "Priority support",
                "Multiple export formats",
                "Team collaboration (3 members)",
                "Custom presets"
              ]}
              featured={true}
            />
            <PricingCard
              tier="Studio"
              price="$99"
              description="For production teams"
              features={[
                "Everything in Creator",
                "Unlimited shots & projects",
                "Advanced batch generation",
                "24/7 dedicated support",
                "Team collaboration (unlimited)",
                "Admin dashboard",
                "Custom integrations",
                "API access"
              ]}
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-5 py-24 lg:py-32">
          <div className="bg-gradient-to-r from-[#032940] to-[#054563] rounded-3xl p-12 lg:p-16 text-center shadow-xl hover:shadow-2xl transition-all duration-300">
            <h2 className="font-heading font-black text-4xl lg:text-5xl text-white mb-6">Ready to Transform Your Workflow?</h2>
            <p className="text-[#E0E0E0] font-semibold text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of creators and production teams using StoryAI to bring their stories to life faster than ever before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="px-8 py-4 rounded-2xl text-base font-black text-[#032940] bg-[#F27D16] hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-lg"
              >
                Get Started Free <ArrowRight size={18} />
              </Link>
              <a
                href="#pricing"
                className="px-8 py-4 rounded-2xl text-base font-black text-[#F27D16] border-2 border-[#F27D16] hover:bg-[#F27D16] hover:text-[#032940] hover:shadow-xl hover:scale-105 transition-all duration-200 inline-flex items-center justify-center"
              >
                View Pricing
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-5 py-16 border-t border-[#E0E0E0]/50 mt-20 bg-gradient-to-b from-white to-[#F9F9F9]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <StoryAILogo className="w-8 h-8" />
                <div className="font-heading font-black text-lg text-[#032940]">StoryAI</div>
              </div>
              <p className="text-sm text-[#666666] font-semibold">AI-powered storyboard creation for creators and studios.</p>
            </div>
            <div>
              <h4 className="font-heading font-black text-[#032940] mb-3">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-[#666666] font-semibold hover:text-[#F27D16]">Features</a></li>
                <li><a href="#pricing" className="text-sm text-[#666666] font-semibold hover:text-[#F27D16]">Pricing</a></li>
                <li><a href="#how" className="text-sm text-[#666666] font-semibold hover:text-[#F27D16]">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-black text-[#032940] mb-3">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-[#666666] font-semibold hover:text-[#F27D16]">About</a></li>
                <li><a href="#" className="text-sm text-[#666666] font-semibold hover:text-[#F27D16]">Blog</a></li>
                <li><a href="#" className="text-sm text-[#666666] font-semibold hover:text-[#F27D16]">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-black text-[#032940] mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-[#666666] font-semibold hover:text-[#F27D16]">Privacy</a></li>
                <li><a href="#" className="text-sm text-[#666666] font-semibold hover:text-[#F27D16]">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#E0E0E0] pt-8 text-center">
            <p className="text-sm text-[#999999] font-semibold">&copy; 2024 StoryAI. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
