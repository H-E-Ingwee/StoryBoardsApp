import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Wand2, Film, ShieldCheck } from 'lucide-react';
import { StoryAILogo } from '../components/StoryAILogo';

function Feature({ icon, title, children }) {
  return (
    <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-[#F27D16]/10 text-[#F27D16] flex items-center justify-center mb-4">
        {React.createElement(icon, { size: 22 })}
      </div>
      <div className="font-heading font-black text-lg text-[#032940] mb-2">{title}</div>
      <div className="text-sm text-[#555555] font-semibold leading-relaxed">{children}</div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F0F0F0] text-[#333333] font-body">
      <header className="bg-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto px-5 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StoryAILogo className="w-12 h-12" />
            <div>
              <div className="font-heading font-black text-2xl text-[#032940] uppercase leading-none">
                StoryAI
              </div>
              <div className="text-xs text-[#730E20] font-bold tracking-widest uppercase">
                Creative Studio
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-black text-[#032940] bg-[#F0F0F0] border border-[#E0E0E0] hover:bg-[#E0E0E0] transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-black text-white bg-[#032940] hover:bg-[#021B2B] transition-colors flex items-center gap-2"
            >
              Get started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
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

