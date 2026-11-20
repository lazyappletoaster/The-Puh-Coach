import React, { useState } from 'react';
import { ArrowRight, Lock, Mic, MessageSquareText, Sparkles, Check, CheckCircle2 } from 'lucide-react';
import { CURRICULUM_LEVELS } from '../data/curriculum';
import { useCoachAuth } from '../context/CoachAuthContext';

export function LandingPage() {
  const { signInWithGoogle, isSigningIn, authError } = useCoachAuth();
  const [stageImgError, setStageImgError] = useState(false);

  return (
    <div className="bg-[#FAFBF9]">
      {/* Hero Section: What The Puh Coach Is About */}
      <section id="about" className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-16 sm:pb-24">
        {authError && (
          <div
            role="alert"
            className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-800"
          >
            Sign-in notice: {authError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Hero Argument */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <div className="text-xs sm:text-sm font-semibold text-emerald-700 tracking-wide">
              Duolingo-Style Real-Life Speaking Trainer · 10 Levels · 250 Named Lessons
            </div>

            <h1
              className="font-bold tracking-tight text-slate-900 leading-[1.08] text-balance"
              style={{ fontSize: 'clamp(2.25rem, 4.2vw, 3.75rem)' }}
            >
              Get naturally good at talking to girls—one short rep at a time.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              The Puh Coach trains guys on real-world conversations with girls—from staying calm
              before saying hello to keeping banter effortless, reading signals, and planning
              first dates. Every lesson pairs real psychology with plain street English, then
              scores your own voice or text rep inside the app.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={isSigningIn}
                className="duo-btn-emerald bg-emerald-600 text-white text-sm sm:text-base font-semibold px-6 py-3.5 rounded-xl inline-flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              >
                {isSigningIn ? 'Opening Google Sign-Up...' : 'Sign Up with Google to Start'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <span className="text-xs sm:text-sm text-slate-500">
                Free access to all 250 lessons &amp; Voice Lab immediately after sign-up.
              </span>
            </div>

            <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-6 max-w-xl">
              <div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">10</div>
                <div className="text-xs text-slate-500 mt-0.5">Skill Levels</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">250</div>
                <div className="text-xs text-slate-500 mt-0.5">Named Lessons</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">Voice + Text</div>
                <div className="text-xs text-slate-500 mt-0.5">Live Feedback</div>
              </div>
            </div>
          </div>

          {/* Right Hero Visual: Inside The Puh Coach App */}
          <div className="lg:col-span-5 flex">
            <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between">
              <div className="aspect-video w-full overflow-hidden bg-slate-100 border-b border-slate-200">
                {!stageImgError ? (
                  <img
                    src="/src/assets/images/social_conversation_stage_1795011537150.jpg"
                    alt="Everyday conversation in a bright bookstore cafe"
                    referrerPolicy="no-referrer"
                    onError={() => setStageImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-800 font-bold text-lg">
                    Real-Life Speaking Scenarios
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-emerald-700">
                      Sample App Feedback · Level 4
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      Coffee Line Opener
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold font-mono tabular-nums text-emerald-700">
                      89/100
                    </div>
                    <div className="text-[11px] text-slate-500">Rep Score</div>
                  </div>
                </div>

                <div className="p-3.5 bg-[#FAFBF9] border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Relaxed opener tied right to the bakery line</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Zero cheesy pickup energy. Starting with an easy question about the pastries gives her a natural out or an easy laugh.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: How Every 3-Step Lesson Works */}
      <section id="how-it-works" className="border-t border-slate-200 bg-white py-16 sm:py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-10">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-semibold text-emerald-700">How It Works</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Built like Duolingo, tuned strictly for real talking-to-girls moments.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              No fluff chapters you will never use. Every single lesson takes 2 to 4 minutes and drills
              one concrete interaction skill in three fast stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            <article className="md:col-span-5 bg-[#FAFBF9] border border-slate-200 rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="text-xs font-mono font-semibold text-emerald-700">01. REAL PSYCHOLOGY, STREET ENGLISH</div>
                <h3 className="text-xl font-bold text-slate-900">
                  Know why a move works before you walk up
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Each lesson breaks down real behavioral psychology—things like vocal pacing, autonomy,
                  open loops, and reading comfort signals—translated into plain everyday talk you can
                  actually remember in a loud cafe or party.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200 flex items-center gap-2 text-xs font-medium text-slate-700">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>2 quick spot-check questions lock the habit in</span>
              </div>
            </article>

            <article className="md:col-span-4 bg-[#FAFBF9] border border-slate-200 rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="text-xs font-mono font-semibold text-emerald-700">02. VOICE OR TEXT COACHING</div>
                <h3 className="text-xl font-bold text-slate-900">
                  Practice out loud or test a text
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Record your voice into the mic or type out what you would say. The app transcribes
                  filler words, scores your rep out of 100, explains how it lands in her head, and
                  reads back a smoother version you can listen to.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200 flex items-center gap-4 text-xs font-medium text-slate-700">
                <span className="inline-flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-emerald-600" /> Voice Audio
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MessageSquareText className="w-3.5 h-3.5 text-emerald-600" /> Text Draft
                </span>
              </div>
            </article>

            <article className="md:col-span-3 bg-[#FAFBF9] border border-slate-200 rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="text-xs font-mono font-semibold text-emerald-700">03. STREAKS &amp; XP</div>
                <h3 className="text-xl font-bold text-slate-900">
                  Track every rep
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Earn XP, protect your 5 Focus Hearts, keep your daily streak alive, and review every
                  past voice transcript and coach score in your saved Practice Log.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200 flex items-center gap-2 text-xs font-medium text-slate-700">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Synced across all devices</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Section 3: Curriculum Preview (Locked Until Google Sign-Up) */}
      <section id="curriculum-overview" className="border-t border-slate-200 bg-[#FAFBF9] py-16 sm:py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <div className="text-xs font-semibold text-emerald-700">
                Inside Your Account · 10 Levels · 250 Named Lessons
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
                Every stage of a real interaction, covered in order.
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Sign up with Google to unlock the interactive S-curve lesson path, all 250 speaking
                reps, and the freeform Voice Lab.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 shrink-0">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Lessons open after sign-up</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CURRICULUM_LEVELS.map((level) => (
              <div
                key={level.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: level.accentHex }}
                    />
                    <span className="font-mono tabular-nums">Level {level.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{level.scienceDomain}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {level.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {level.summary}
                  </p>
                </div>

                <div className="shrink-0 text-right space-y-1">
                  <div className="text-xs font-mono tabular-nums font-semibold text-slate-700">
                    25 lessons
                  </div>
                  <Lock className="w-4 h-4 text-slate-400 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Final Conversion Block */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="max-w-[820px] mx-auto px-4 sm:px-6 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
            Ready to start Level 1?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            Sign up in one click with your Google account to enter the 250-lesson path, test lines
            in the Voice Lab, and save every score and streak automatically.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={isSigningIn}
              className="duo-btn-emerald bg-emerald-600 text-white text-sm sm:text-base font-semibold px-7 py-3.5 rounded-xl inline-flex items-center gap-2.5 cursor-pointer disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
            >
              {isSigningIn ? 'Signing in with Google...' : 'Sign Up with Google'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
