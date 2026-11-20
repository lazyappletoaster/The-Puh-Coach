import React, { useState, useMemo } from 'react';
import {
  Check,
  Play,
  Flame,
  Heart,
  Trophy,
  Mic,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { CURRICULUM_LEVELS } from '../data/curriculum';
import { useCoachAuth } from '../context/CoachAuthContext';
import type { Lesson } from '../types/curriculum';

interface LearningPathViewProps {
  onStartLesson: (lesson: Lesson) => void;
  onOpenVoiceLab: () => void;
}

const SINUSOID_OFFSETS = [0, 52, 84, 52, 0, -52, -84, -52];

export function LearningPathView({
  onStartLesson,
  onOpenVoiceLab,
}: LearningPathViewProps) {
  const { user, profile, progressMap, signInWithGoogle, restoreHearts, authError } =
    useCoachAuth();

  const [selectedLevelId, setSelectedLevelId] = useState<number>(
    profile?.currentLevel || 1
  );

  const activeLevel = useMemo(
    () => CURRICULUM_LEVELS.find((l) => l.id === selectedLevelId) || CURRICULUM_LEVELS[0],
    [selectedLevelId]
  );

  const levelCompletedCount = useMemo(
    () =>
      activeLevel.lessons.filter((lesson) => progressMap[lesson.id]?.completed).length,
    [activeLevel, progressMap]
  );

  const totalCompletedCount = useMemo(
    () => Object.values(progressMap).filter((p) => p.completed).length,
    [progressMap]
  );

  const nextLessonInLevel = useMemo(() => {
    const firstIncomplete = activeLevel.lessons.find(
      (lesson) => !progressMap[lesson.id]?.completed
    );
    return firstIncomplete || activeLevel.lessons[0];
  }, [activeLevel, progressMap]);

  const xpTotal = profile?.xp ?? totalCompletedCount * 20;
  const streakDays = profile?.streak ?? 0;
  const hearts = profile?.hearts ?? 5;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      {authError && (
        <div
          role="alert"
          className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-800"
        >
          Sign-in message: {authError}
        </div>
      )}

      {/* Level Selector Tabs (Interactive Segmented Switcher across 10 Levels) */}
      <section className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-3">
          <h2 className="text-sm font-semibold text-slate-600">
            10 Levels · 250 Real-World Interaction Lessons
          </h2>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {totalCompletedCount} / 250 completed
          </span>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl overflow-x-auto">
          {CURRICULUM_LEVELS.map((lvl) => {
            const isSelected = lvl.id === activeLevel.id;
            const doneInLvl = lvl.lessons.filter(
              (l) => progressMap[l.id]?.completed
            ).length;

            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setSelectedLevelId(lvl.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="font-mono tabular-nums">L{lvl.id}</span>
                <span className="hidden xl:inline max-w-[120px] truncate">
                  {lvl.title.split('&')[0].trim()}
                </span>
                {doneInLvl > 0 && (
                  <span
                    className={`font-mono tabular-nums text-[11px] ${
                      isSelected ? 'text-emerald-100' : 'text-emerald-700'
                    }`}
                  >
                    {doneInLvl}/25
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Two-Zone Duolingo Workspace (Left 68% Winding Path, Right 32% Coach Companion) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Zone: Active Level Header + Winding Duolingo Lesson Path */}
        <div className="lg:col-span-8 space-y-8">
          {/* Active Level Banner */}
          <section
            className="rounded-2xl p-6 sm:p-7 text-white relative overflow-hidden"
            style={{ backgroundColor: activeLevel.accentHex }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-2 max-w-xl">
                <div className="text-xs font-medium text-white/85">
                  Level {activeLevel.id} of 10 · {activeLevel.scienceDomain} ·{' '}
                  <span className="font-mono tabular-nums">
                    {levelCompletedCount}/25 lessons
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance">
                  {activeLevel.title}
                </h1>
                <p className="text-sm text-white/90 leading-relaxed">
                  {activeLevel.summary}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onStartLesson(nextLessonInLevel)}
                className="bg-white text-slate-900 hover:bg-slate-50 font-semibold text-sm px-5 py-3 rounded-xl inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer shadow-sm transition-transform active:translate-y-0.5 self-start sm:self-center"
              >
                <Play className="w-4 h-4 fill-slate-900" />
                {levelCompletedCount === 0 ? 'Start Level' : 'Continue Next'}
              </button>
            </div>
          </section>

          {/* Winding Duolingo S-Curve Path of All 25 Named Lessons in This Level */}
          <section
            aria-label={`Level ${activeLevel.id} lesson path`}
            className="bg-white border border-slate-200 rounded-2xl py-10 px-4 sm:px-8"
          >
            <div className="max-w-lg mx-auto space-y-7">
              {activeLevel.lessons.map((lesson, index) => {
                const progress = progressMap[lesson.id];
                const isCompleted = Boolean(progress?.completed);
                const isCurrentFrontier = lesson.id === nextLessonInLevel.id;
                const offsetPx = SINUSOID_OFFSETS[index % SINUSOID_OFFSETS.length];
                const isMilestone = lesson.order % 5 === 0;

                return (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-center"
                    style={{ transform: `translateX(${offsetPx}px)` }}
                  >
                    <div className="flex flex-col items-center text-center group max-w-[230px]">
                      <div className="relative">
                        {isCurrentFrontier && (
                          <div className="mb-2 text-[11px] font-bold tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-0.5">
                            Up Next
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => onStartLesson(lesson)}
                          aria-label={`Start Lesson ${lesson.order}: ${lesson.title}`}
                          className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg cursor-pointer transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 ${
                            isCompleted
                              ? 'duo-btn-amber bg-amber-500 text-white'
                              : isCurrentFrontier
                              ? 'duo-btn-emerald bg-emerald-600 text-white ring-4 ring-emerald-200'
                              : isMilestone
                              ? 'duo-btn-slate bg-slate-100 border-2 border-slate-300 text-slate-800 hover:bg-emerald-50 hover:border-emerald-400'
                              : 'duo-btn-slate bg-white border-2 border-slate-200 text-slate-800 hover:bg-emerald-50 hover:border-emerald-400'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-7 h-7 stroke-[2.75]" />
                          ) : isMilestone ? (
                            <Trophy className="w-6 h-6" />
                          ) : (
                            <span className="font-mono tabular-nums text-base">
                              {lesson.order}
                            </span>
                          )}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onStartLesson(lesson)}
                        className="mt-2.5 text-center cursor-pointer"
                      >
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                          {lesson.order}. {lesson.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {lesson.sciencePrinciple}
                          {progress?.bestScore !== undefined && (
                            <span className="font-mono tabular-nums text-emerald-700">
                              {' '}
                              · {progress.bestScore}%
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Companion Rail: Coach Puh, Metrics, Google Sync */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Unboxed Clean Metrics Panel */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Daily Momentum
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center pt-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-center gap-1 text-amber-600 font-bold text-lg font-mono tabular-nums">
                  <Flame className="w-4 h-4 fill-amber-500" />
                  {streakDays}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Streak</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-emerald-700 font-bold text-lg font-mono tabular-nums">
                  {xpTotal}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Total XP</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-center gap-1 text-rose-600 font-bold text-lg font-mono tabular-nums">
                  <Heart className="w-4 h-4 fill-rose-500" />
                  {hearts}/5
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Focus</div>
              </div>
            </div>

            {user && hearts < 5 && (
              <button
                type="button"
                onClick={restoreHearts}
                className="w-full inline-flex items-center justify-center gap-2 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Refill Focus Hearts
              </button>
            )}
          </section>

          {/* App Voice & Text Coaching Card */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <Mic className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  The Puh Coach Lab
                </h3>
                <p className="text-xs text-slate-500">
                  Instant AI Voice &amp; Text Feedback
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Every lesson teaches real talking-to-girls skills backed by actual psychology—zero cheesy scripts, zero filler. Want to test an opener, text, or comeback right now?
            </p>

            <button
              type="button"
              onClick={onOpenVoiceLab}
              className="duo-btn-emerald w-full bg-emerald-600 text-white text-sm font-semibold py-2.5 px-4 rounded-xl inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              Open Free Voice Lab
            </button>
          </section>

          {/* Google Account Sync Status Card */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
            {user ? (
              <>
                <div className="text-xs font-semibold text-emerald-700">
                  Cloud Sync Active
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  Signed in as {user.displayName}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All {totalCompletedCount} completed lessons, XP, streaks, and voice coaching logs are saved securely to your account.
                </p>
              </>
            ) : (
              <>
                <div className="text-sm font-bold text-slate-900">
                  Save Your Progress Across Devices
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Try any of the 250 lessons right away, or sign in with Google to persist your XP, streak, and personalized voice coaching history.
                </p>
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="duo-btn-slate w-full bg-white border border-slate-200 text-slate-900 text-xs font-semibold py-2.5 px-4 rounded-xl inline-flex items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer"
                >
                  Sign In with Google
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
