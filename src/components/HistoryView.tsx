import React from 'react';
import { Mic, Type as TypeIcon } from 'lucide-react';
import { CURRICULUM_LEVELS } from '../data/curriculum';
import { useCoachAuth } from '../context/CoachAuthContext';

export function HistoryView() {
  const { user, profile, progressMap, sessions, signInWithGoogle } = useCoachAuth();

  const totalCompleted = Object.values(progressMap).filter((p) => p.completed).length;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-emerald-700">
            Your Progress &amp; Saved Practice Reps
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Practice Log &amp; Level Progress
          </h1>
        </div>
        <div className="text-sm text-slate-600 font-mono tabular-nums">
          {profile?.xp ?? totalCompleted * 20} XP · {profile?.streak ?? 0}d streak ·{' '}
          {totalCompleted}/250 lessons
        </div>
      </section>

      {!user && (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              Sign In with Google to Persist Your Coaching Log
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Your practice transcripts and 10-level mastery stats sync automatically once signed in.
            </p>
          </div>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="duo-btn-emerald bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
          >
            Sign In with Google
          </button>
        </section>
      )}

      {/* 10-Level Progress Grid */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-bold text-slate-900">
          Progress Across All 10 Levels
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CURRICULUM_LEVELS.map((lvl) => {
            const doneCount = lvl.lessons.filter(
              (l) => progressMap[l.id]?.completed
            ).length;
            const pct = Math.round((doneCount / lvl.lessons.length) * 100);

            return (
              <div
                key={lvl.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    L{lvl.id}. {lvl.title}
                  </div>
                  <div className="text-xs font-mono tabular-nums text-slate-600 shrink-0">
                    {doneCount}/25 ({pct}%)
                  </div>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: lvl.accentHex,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Personalized AI Feedback Sessions */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">
            Recent Voice &amp; Text Coaching Reps
          </h2>
        </div>

        {sessions.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Complete any lesson’s speaking rep or try the Voice Lab to see your personalized coaching log here.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sessions.map((s, idx) => (
              <div key={s.id || idx} className="p-6 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    {s.mode === 'voice' ? (
                      <Mic className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <TypeIcon className="w-4 h-4 text-slate-500" />
                    )}
                    <span>{s.lessonTitle}</span>
                    <span className="text-xs font-mono text-slate-400">
                      · {s.lessonId}
                    </span>
                  </div>
                  <div className="text-sm font-mono font-bold tabular-nums text-emerald-700">
                    {s.score}/100
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 italic">
                  "{s.transcriptOrText}"
                </p>
                <p className="text-xs sm:text-sm text-slate-800">
                  {s.coachSummary}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
