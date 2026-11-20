import React, { useState } from 'react';
import {
  X,
  Heart,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Sparkles,
  Volume2,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import type { Lesson, CoachingEvaluation, QuizQuestion } from '../types/curriculum';
import { useCoachAuth } from '../context/CoachAuthContext';
import { VoiceRecorderInput } from './VoiceRecorderInput';

interface LessonPlayerProps {
  lesson: Lesson;
  levelTitle: string;
  onClose: () => void;
  onNextLesson?: () => void;
}

type LessonStep = 'concept' | 'scenario' | 'speaking' | 'complete';

export function LessonPlayer({
  lesson,
  levelTitle,
  onClose,
  onNextLesson,
}: LessonPlayerProps) {
  const { profile, user, signInWithGoogle, recordLessonAttempt } = useCoachAuth();

  const [step, setStep] = useState<LessonStep>('concept');
  const [hearts, setHearts] = useState<number>(profile?.hearts ?? 5);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [checkedQuiz, setCheckedQuiz] = useState<{
    correct: boolean;
    explanation: string;
  } | null>(null);

  const [evaluation, setEvaluation] = useState<CoachingEvaluation | null>(null);
  const [evalMode, setEvalMode] = useState<'voice' | 'text'>('voice');
  const [isSaving, setIsSaving] = useState(false);
  const [playingImproved, setPlayingImproved] = useState(false);
  const [emblemError, setEmblemError] = useState(false);

  const progressPct =
    step === 'concept'
      ? 33
      : step === 'scenario'
      ? 66
      : step === 'speaking'
      ? evaluation
        ? 95
        : 82
      : 100;

  const currentQuiz: QuizQuestion =
    step === 'concept' ? lesson.conceptCheck : lesson.scenarioCheck;

  const handleCheckQuiz = () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === currentQuiz.correctIndex;
    if (!isCorrect) {
      setHearts((prev) => Math.max(1, prev - 1));
    }
    setCheckedQuiz({
      correct: isCorrect,
      explanation: currentQuiz.explanation,
    });
  };

  const handleAdvanceFromQuiz = () => {
    setSelectedOption(null);
    setCheckedQuiz(null);
    if (step === 'concept') {
      setStep('scenario');
    } else if (step === 'scenario') {
      setStep('speaking');
    }
  };

  const handleVoiceEvaluated = async (result: CoachingEvaluation, mode: 'voice' | 'text') => {
    setEvaluation(result);
    setEvalMode(mode);
    setIsSaving(true);
    try {
      await recordLessonAttempt({
        lessonId: lesson.id,
        levelId: lesson.levelId,
        lessonTitle: lesson.title,
        mode,
        transcriptOrText: result.transcript || '(Voice response)',
        score: result.score,
        passed: result.passed,
        xpReward: lesson.xpReward,
        coachSummary: result.coachSummary,
        heartsRemaining: hearts,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlayImprovedExample = async () => {
    if (!evaluation?.improvedExample || playingImproved) return;
    setPlayingImproved(true);
    try {
      const resp = await fetch('/api/coach/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: evaluation.improvedExample,
          style: 'Warm, grounded, conversational poise',
        }),
      });
      const data = await resp.json();
      if (resp.ok && data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        await audio.play();
      }
    } finally {
      setPlayingImproved(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAFBF9] flex flex-col overflow-y-auto">
      {/* Top Lesson Progress Header */}
      <div className="sticky top-0 z-20 bg-[#FAFBF9]/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-[920px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Exit lesson"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Duolingo-style Progress Bar */}
          <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-rose-600 tabular-nums shrink-0">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>{hearts}</span>
          </div>
        </div>
      </div>

      {/* Main Centered Lesson Stage */}
      <main className="flex-1 max-w-[820px] w-full mx-auto px-4 sm:px-6 py-8 pb-24">
        {/* Clean Unboxed Lesson Metadata Line */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3">
          <span className="font-semibold text-emerald-700">
            Level {lesson.levelId} · Lesson {lesson.order}
          </span>
          <span aria-hidden="true">·</span>
          <span>{levelTitle}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">+{lesson.xpReward} XP</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-6 text-balance">
          {lesson.title}
        </h1>

        {step === 'concept' && (
          <div className="space-y-6">
            {/* Scientific Foundation Card */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-500">
                    {lesson.sciencePrinciple} · {lesson.researcherCitation}
                  </div>
                  <p className="text-[15px] text-slate-800 leading-relaxed">
                    {lesson.briefing}
                  </p>
                </div>
              </div>
            </section>

            {/* Quiz 1: Concept Check */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">
                1. Why This Works
              </h2>
              <p className="text-[15px] text-slate-700 font-medium">
                {currentQuiz.question}
              </p>

              <div className="space-y-3">
                {currentQuiz.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrectOpt = checkedQuiz && idx === currentQuiz.correctIndex;
                  const isWrongSelected = checkedQuiz && isSelected && !checkedQuiz.correct;

                  let styleClass =
                    'bg-white border-slate-200 hover:border-slate-300 text-slate-800';
                  if (isCorrectOpt) {
                    styleClass = 'bg-emerald-50 border-emerald-500 text-emerald-950';
                  } else if (isWrongSelected) {
                    styleClass = 'bg-rose-50 border-rose-400 text-rose-950';
                  } else if (isSelected) {
                    styleClass = 'bg-emerald-50/60 border-emerald-600 text-slate-900';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={Boolean(checkedQuiz)}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-colors flex items-center gap-3.5 cursor-pointer disabled:cursor-default ${styleClass}`}
                    >
                      <span className="w-7 h-7 rounded-lg border border-slate-300 bg-white flex items-center justify-center text-xs font-mono font-semibold text-slate-700 shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-sm sm:text-[15px] leading-snug">{option}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {step === 'scenario' && (
          <div className="space-y-6">
            <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-2">
              <div className="text-xs font-semibold text-slate-500">
                2. Real-Life Spot Check · {lesson.sciencePrinciple}
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                {currentQuiz.question}
              </h2>
            </section>

            <div className="space-y-3">
              {currentQuiz.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectOpt = checkedQuiz && idx === currentQuiz.correctIndex;
                const isWrongSelected = checkedQuiz && isSelected && !checkedQuiz.correct;

                let styleClass =
                  'bg-white border-slate-200 hover:border-slate-300 text-slate-800';
                if (isCorrectOpt) {
                  styleClass = 'bg-emerald-50 border-emerald-500 text-emerald-950';
                } else if (isWrongSelected) {
                  styleClass = 'bg-rose-50 border-rose-400 text-rose-950';
                } else if (isSelected) {
                  styleClass = 'bg-emerald-50/60 border-emerald-600 text-slate-900';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={Boolean(checkedQuiz)}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-colors flex items-center gap-3.5 cursor-pointer disabled:cursor-default ${styleClass}`}
                  >
                    <span className="w-7 h-7 rounded-lg border border-slate-300 bg-white flex items-center justify-center text-xs font-mono font-semibold text-slate-700 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm sm:text-[15px] leading-snug">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 'speaking' && (
          <div className="space-y-6">
            {/* Speaking Challenge Briefing */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="text-xs font-semibold text-emerald-700">
                3. Say It Out Loud (Voice or Text)
              </div>
              <p className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
                {lesson.speakingPrompt}
              </p>
              <div className="pt-2 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-500 mb-1.5">
                  What the App Checks Here
                </div>
                <ul className="text-sm text-slate-700 space-y-1">
                  {lesson.targetCues.map((cue, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-emerald-600 font-mono text-xs">0{idx + 1}.</span>
                      <span>{cue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Voice or Text Input (Before Evaluation or Retry) */}
            {!evaluation ? (
              <VoiceRecorderInput
                lessonTitle={lesson.title}
                sciencePrinciple={`${lesson.sciencePrinciple} (${lesson.researcherCitation})`}
                briefing={lesson.briefing}
                prompt={lesson.speakingPrompt}
                targetCues={lesson.targetCues}
                modelExample={lesson.modelExample}
                onEvaluated={handleVoiceEvaluated}
              />
            ) : (
              <div className="space-y-5">
                {/* Evaluation Summary Card */}
                <section
                  className={`border rounded-2xl p-6 space-y-4 ${
                    evaluation.passed
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : 'bg-amber-50/70 border-amber-300'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {evaluation.passed ? (
                        <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-7 h-7 text-amber-600 shrink-0" />
                      )}
                      <div>
                        <div className="text-base font-bold text-slate-900">
                          {evaluation.passed
                            ? 'Rep Passed — Strong Execution'
                            : 'Almost There — Good Foundation to Refine'}
                        </div>
                        <div className="text-xs text-slate-600">
                          Evaluated via {evalMode === 'voice' ? 'Spoken Voice Audio' : 'Written Draft'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                        {evaluation.score}/100
                      </div>
                      <div className="text-xs text-slate-500">Coach Score</div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-800 leading-relaxed">
                    {evaluation.coachSummary}
                  </p>
                </section>

                {/* Verbatim Transcript */}
                <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
                  <div className="text-xs font-semibold text-slate-500">
                    What You Delivered ({evalMode === 'voice' ? 'Verbatim Voice Transcript' : 'Text Draft'})
                  </div>
                  <p className="text-sm text-slate-800 italic leading-relaxed">
                    "{evaluation.transcript}"
                  </p>
                </section>

                {/* Detailed Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
                    <div className="text-xs font-semibold text-emerald-700">
                      Observed Strengths
                    </div>
                    <ul className="space-y-1.5 text-sm text-slate-700">
                      {evaluation.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-semibold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
                    <div className="text-xs font-semibold text-slate-700">
                      Pace &amp; Vibe Polish
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {evaluation.vocalAndDeliveryTip}
                    </p>
                  </section>
                </div>

                <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
                  <div className="text-xs font-semibold text-slate-700">
                    Why It Lands in Her Head ({lesson.sciencePrinciple})
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {evaluation.psychologyBreakdown}
                  </p>
                </section>

                <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold text-slate-700">
                      Smoother Way to Say It Aloud
                    </div>
                    <button
                      type="button"
                      onClick={handlePlayImprovedExample}
                      disabled={playingImproved}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer disabled:opacity-60"
                    >
                      {playingImproved ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                      Listen
                    </button>
                  </div>
                  <p className="text-sm text-slate-900 font-medium leading-relaxed">
                    "{evaluation.improvedExample}"
                  </p>
                </section>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEvaluation(null)}
                    className="duo-btn-slate inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Another Rep
                  </button>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setStep('complete')}
                    className="duo-btn-emerald inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl cursor-pointer"
                  >
                    {isSaving ? 'Saving Progress...' : 'Complete Lesson'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'complete' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-6">
            <div className="flex justify-center">
              {!emblemError ? (
                <img
                  src="/src/assets/images/mastery_emblem_badge_1795011536339.jpg"
                  alt="Lesson Mastery Emblem"
                  referrerPolicy="no-referrer"
                  onError={() => setEmblemError(true)}
                  className="w-28 h-28 rounded-2xl object-cover border border-slate-200"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-amber-600" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-emerald-700">
                Lesson Complete · {lesson.id}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {lesson.title}
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Rep locked in—you nailed the mindset, the real-life situation, and your own live delivery.
              </p>
            </div>

            <div className="flex items-center justify-center gap-8 py-4 border-y border-slate-100 text-sm">
              <div>
                <div className="text-xl font-bold font-mono tabular-nums text-emerald-700">
                  +{evaluation?.passed ? lesson.xpReward : 5} XP
                </div>
                <div className="text-xs text-slate-500">Earned</div>
              </div>
              <div>
                <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
                  {evaluation?.score ?? 0}/100
                </div>
                <div className="text-xs text-slate-500">Speaking Score</div>
              </div>
              <div>
                <div className="text-xl font-bold font-mono tabular-nums text-amber-600">
                  {hearts}/5
                </div>
                <div className="text-xs text-slate-500">Focus Hearts</div>
              </div>
            </div>

            {!user && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="text-xs text-slate-700">
                  Sign in with Google to save your XP, daily streak, and completed lessons across sessions.
                </div>
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="duo-btn-emerald bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Sign In with Google
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="duo-btn-slate px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl cursor-pointer"
              >
                Back to Path
              </button>
              {onNextLesson && (
                <button
                  type="button"
                  onClick={onNextLesson}
                  className="duo-btn-emerald inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl cursor-pointer"
                >
                  Continue to Next Lesson
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Duolingo-Style Sticky Bottom Action Bar for Quiz Steps */}
      {(step === 'concept' || step === 'scenario') && (
        <div
          className={`fixed bottom-0 inset-x-0 border-t transition-colors z-30 ${
            checkedQuiz
              ? checkedQuiz.correct
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-rose-50 border-rose-300'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {checkedQuiz ? (
              <>
                <div className="flex items-start gap-3">
                  {checkedQuiz.correct ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div
                      className={`text-sm font-bold ${
                        checkedQuiz.correct ? 'text-emerald-900' : 'text-rose-900'
                      }`}
                    >
                      {checkedQuiz.correct ? 'Spot on!' : 'Not quite — note the mechanism:'}
                    </div>
                    <p
                      className={`text-xs sm:text-sm ${
                        checkedQuiz.correct ? 'text-emerald-800' : 'text-rose-800'
                      }`}
                    >
                      {checkedQuiz.explanation}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAdvanceFromQuiz}
                  className="duo-btn-emerald bg-emerald-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl whitespace-nowrap shrink-0 cursor-pointer self-end sm:self-center"
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                <div className="text-xs text-slate-500">
                  Pick the real, psychologically sound move before continuing.
                </div>
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleCheckQuiz}
                  className="duo-btn-emerald bg-emerald-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40 disabled:shadow-none self-end sm:self-center"
                >
                  Check Answer
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
