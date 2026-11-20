import React, { useState } from 'react';
import { Volume2, Loader2, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import type { CoachingEvaluation } from '../types/curriculum';
import { VoiceRecorderInput } from './VoiceRecorderInput';
import { useCoachAuth } from '../context/CoachAuthContext';

interface LabScenario {
  id: string;
  title: string;
  sciencePrinciple: string;
  briefing: string;
  prompt: string;
  targetCues: [string, string, string];
  modelExample: string;
}

const PRESET_SCENARIOS: LabScenario[] = [
  {
    id: 'L4-01',
    title: 'Coffee Line Opener',
    sciencePrinciple: 'Shared Moment + Easy Reply (Clark, 1996)',
    briefing: 'Comment casually on what’s right in front of both of you—zero cheesy pickup lines, easy for her to answer.',
    prompt: 'You’re standing behind a girl in a busy Saturday bakery line eyeing the pastry tray. Drop a chill, low-pressure opener.',
    targetCues: [
      'Natural situational comment',
      'Relaxed unhurried pace',
      'Super easy open question',
    ],
    modelExample: 'Those cardamom buns look crazy good from over here—have you actually tried them before, or guessing blind too?',
  },
  {
    id: 'L6-01',
    title: 'Hype Her Good News (No One-Upping)',
    sciencePrinciple: 'Active-Constructive Responding (Gable, 2004)',
    briefing: 'Genuinely hyping her win builds way more closeness than saying "Nice, I did that too." Keep the mic on her.',
    prompt: 'A girl you’re chatting with lights up telling you she finally landed the apartment or creative gig she’s been chasing for months. Respond warmly.',
    targetCues: [
      'Genuine excited warmth',
      'Strictly about her win',
      'Curious question about her reaction',
    ],
    modelExample: 'Wait, no way—congratulations!! After chasing that for months, did you celebrate right away or freeze staring at the email?',
  },
  {
    id: 'L9-01',
    title: 'Ask for Her Number Smoothly',
    sciencePrinciple: 'Clear Invite + Zero Pressure (Deci & Ryan)',
    briefing: 'End right off a good laugh with a clear, confident number ask tied to a real vibe—no trailing off awkwardly.',
    prompt: 'You’ve chatted smoothly with a girl for 10 minutes at a patio spot and your friends are about to leave. Ask to swap numbers cleanly.',
    targetCues: [
      'Ends on high warm energy',
      'Clear simple ask',
      'Casual coffee/drink tie-in',
    ],
    modelExample: 'Hey, my buddies are giving me the wrap-it-up stare—let’s swap numbers before I run so we can actually grab coffee this week.',
  },
  {
    id: 'L10-04',
    title: 'Take a Polite "No" Like a Pro',
    sciencePrinciple: 'Rejection Resilience & No Pushback (Downey / Brehm)',
    briefing: 'Accepting a polite decline warmly with zero saltiness or persistence protects your dignity and makes you look rock solid.',
    prompt: 'You ask a girl for coffee next week and she smiles kindly: "I’m flattered, honestly just seeing someone / not really looking to date right now." Respond cleanly.',
    targetCues: [
      'Instant warm acceptance',
      'Zero pushback or guilt',
      'Cheerful dignified goodbye',
    ],
    modelExample: 'Totally respect that—still really glad I said hello tonight, hope the rest of your week goes great!',
  },
];

export function VoiceLabView() {
  const { recordLessonAttempt } = useCoachAuth();
  const [selectedPreset, setSelectedPreset] = useState<LabScenario>(PRESET_SCENARIOS[0]);
  const [customScenario, setCustomScenario] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [evaluation, setEvaluation] = useState<CoachingEvaluation | null>(null);
  const [evalMode, setEvalMode] = useState<'voice' | 'text'>('voice');
  const [playingModel, setPlayingModel] = useState(false);
  const [heroError, setHeroError] = useState(false);

  const activeTitle = useCustom ? 'Custom Real-Life Practice Rep' : selectedPreset.title;
  const activePrompt = useCustom
    ? customScenario.trim() || 'Say hello calmly to a girl standing near you at a bar or coffee shop.'
    : selectedPreset.prompt;
  const activePrinciple = useCustom
    ? 'Relaxed Tone + Warmth First + Zero-Pressure Confidence'
    : selectedPreset.sciencePrinciple;

  const handleEvaluated = async (res: CoachingEvaluation, mode: 'voice' | 'text') => {
    setEvaluation(res);
    setEvalMode(mode);
    await recordLessonAttempt({
      lessonId: useCustom ? 'L10-25' : selectedPreset.id,
      levelId: useCustom ? 10 : Number(selectedPreset.id.split('-')[0].slice(1)),
      lessonTitle: activeTitle,
      mode,
      transcriptOrText: res.transcript || '(Voice response)',
      score: res.score,
      passed: res.passed,
      xpReward: 20,
      coachSummary: res.coachSummary,
      heartsRemaining: 5,
    });
  };

  const handlePlayImproved = async () => {
    if (!evaluation?.improvedExample || playingModel) return;
    setPlayingModel(true);
    try {
      const resp = await fetch('/api/coach/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: evaluation.improvedExample }),
      });
      const data = await resp.json();
      if (resp.ok && data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        await audio.play();
      }
    } finally {
      setPlayingModel(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Editorial Two-Column Intro */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-3">
          <div className="text-xs font-semibold text-emerald-700">
            Free-Form Voice &amp; Text Practice Sandbox
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance">
            Test what you’d actually say before stepping out tonight.
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            Pick a real interaction below—or type your own spot. Speak into your mic or write what you’d say to get honest street-smart feedback on your pace, tone, and why it lands right in her head.
          </p>
        </div>

        <div className="lg:col-span-5 min-h-[220px] bg-slate-100">
          {!heroError ? (
            <img
              src="/src/assets/images/social_conversation_stage_1795011537150.jpg"
              alt="Relaxed everyday conversation in a sunlit bookstore cafe"
              referrerPolicy="no-referrer"
              onError={() => setHeroError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-8 bg-emerald-50 text-emerald-800 font-semibold text-sm">
              Real-Life Interaction Practice
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Scenario Picker */}
        <aside className="lg:col-span-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700">
            Pick a Real Spot
          </h2>

          <div className="space-y-2.5">
            {PRESET_SCENARIOS.map((sc) => {
              const active = !useCustom && selectedPreset.id === sc.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => {
                    setUseCustom(false);
                    setSelectedPreset(sc);
                    setEvaluation(null);
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-colors cursor-pointer ${
                    active
                      ? 'bg-emerald-50 border-emerald-500'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm font-bold text-slate-900">{sc.title}</div>
                  <div className="text-xs text-slate-500 mt-1">{sc.sciencePrinciple}</div>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setUseCustom(true);
                setEvaluation(null);
              }}
              className={`w-full text-left p-4 rounded-2xl border transition-colors cursor-pointer ${
                useCustom
                  ? 'bg-emerald-50 border-emerald-500'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-sm font-bold text-slate-900">
                Custom Situation
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Practice any opener, banter moment, text, or number ask
              </div>
            </button>
          </div>
        </aside>

        {/* Active Practice Stage */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-6">
          {useCustom ? (
            <div className="space-y-2">
              <label
                htmlFor="custom-scenario-input"
                className="block text-xs font-semibold text-slate-700"
              >
                Describe the Moment
              </label>
              <input
                id="custom-scenario-input"
                type="text"
                value={customScenario}
                onChange={(e) => setCustomScenario(e.target.value)}
                placeholder="e.g., Walking past a girl at a coffee shop or texting her after getting her number"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          ) : (
            <div className="space-y-2 pb-4 border-b border-slate-100">
              <div className="text-xs font-semibold text-emerald-700">
                {selectedPreset.sciencePrinciple}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{selectedPreset.title}</h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                {selectedPreset.prompt}
              </p>
            </div>
          )}

          {!evaluation ? (
            <VoiceRecorderInput
              lessonTitle={activeTitle}
              sciencePrinciple={activePrinciple}
              briefing={useCustom ? 'Keep it relaxed, warm first, playful, and zero weird pressure.' : selectedPreset.briefing}
              prompt={activePrompt}
              targetCues={
                useCustom
                  ? ['Chill relaxed tone', 'Natural unforced words', 'Zero creepy pressure']
                  : selectedPreset.targetCues
              }
              modelExample={selectedPreset.modelExample}
              onEvaluated={handleEvaluated}
            />
          ) : (
            <div className="space-y-5">
              <div
                className={`border rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 ${
                  evaluation.passed
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-amber-50 border-amber-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {evaluation.passed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {evaluation.coachSummary}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Mode: {evalMode === 'voice' ? 'Voice Recording' : 'Text Draft'}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                  {evaluation.score}/100
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="text-xs font-semibold text-slate-500">Transcript</div>
                <p className="text-sm text-slate-800 italic">"{evaluation.transcript}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="text-xs font-semibold text-emerald-700">Strengths</div>
                  <ul className="text-sm text-slate-700 space-y-1">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="text-xs font-semibold text-slate-700">Vocal &amp; Delivery Tip</div>
                  <p className="text-sm text-slate-700">{evaluation.vocalAndDeliveryTip}</p>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-xl space-y-1.5">
                <div className="text-xs font-semibold text-slate-700">Why It Lands Psychologically</div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {evaluation.psychologyBreakdown}
                </p>
              </div>

              <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-700">Model Phrasing</div>
                  <button
                    type="button"
                    onClick={handlePlayImproved}
                    disabled={playingModel}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    {playingModel ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                    Listen
                  </button>
                </div>
                <p className="text-sm font-medium text-slate-900">
                  "{evaluation.improvedExample}"
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEvaluation(null)}
                className="duo-btn-emerald inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Practice Another Rep
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
