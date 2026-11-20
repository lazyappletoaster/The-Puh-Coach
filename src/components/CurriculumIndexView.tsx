import React, { useState, useMemo } from 'react';
import { Search, CheckCircle2, Play } from 'lucide-react';
import { CURRICULUM_LEVELS } from '../data/curriculum';
import { useCoachAuth } from '../context/CoachAuthContext';
import type { Lesson } from '../types/curriculum';

interface CurriculumIndexViewProps {
  onStartLesson: (lesson: Lesson) => void;
}

export function CurriculumIndexView({ onStartLesson }: CurriculumIndexViewProps) {
  const { progressMap } = useCoachAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');

  const filteredLevels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CURRICULUM_LEVELS.filter(
      (lvl) => levelFilter === 'all' || lvl.id === levelFilter
    ).map((lvl) => ({
      ...lvl,
      lessons: lvl.lessons.filter(
        (lesson) =>
          !q ||
          lesson.title.toLowerCase().includes(q) ||
          lesson.sciencePrinciple.toLowerCase().includes(q) ||
          lesson.researcherCitation.toLowerCase().includes(q)
      ),
    })).filter((lvl) => lvl.lessons.length > 0);
  }, [searchQuery, levelFilter]);

  const totalMatching = useMemo(
    () => filteredLevels.reduce((acc, lvl) => acc + lvl.lessons.length, 0),
    [filteredLevels]
  );

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      <section className="space-y-2">
        <div className="text-xs font-semibold text-emerald-700">
          Full Street Playbook · 10 Levels · 250 Named Lessons
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Every Interaction Lesson &amp; Psych Hack
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          Browse all 25 lessons across every level—pure real-life interaction skills from cooling pre-approach nerves to banter, group vibes, getting her number, and taking an L with class.
        </p>
      </section>

      {/* Filter & Search Bar */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search openers, banter, texting, or psych rules..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setLevelFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
              levelFilter === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All (250)
          </button>
          {CURRICULUM_LEVELS.map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => setLevelFilter(lvl.id)}
              className={`px-2.5 py-1.5 text-xs font-mono font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
                levelFilter === lvl.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              L{lvl.id}
            </button>
          ))}
        </div>
      </section>

      <div className="text-xs font-mono tabular-nums text-slate-500">
        Showing {totalMatching} lessons
      </div>

      {/* Levels & Named Lesson Lists */}
      <div className="space-y-8">
        {filteredLevels.map((lvl) => (
          <section
            key={lvl.id}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-emerald-700">
                  Level {lvl.id} · {lvl.scienceDomain}
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  {lvl.title}
                </h2>
              </div>
              <div className="text-xs font-mono tabular-nums text-slate-500">
                {lvl.lessons.length} lessons
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {lvl.lessons.map((lesson) => {
                const progress = progressMap[lesson.id];
                const done = Boolean(progress?.completed);

                return (
                  <div
                    key={lesson.id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono tabular-nums text-slate-400">
                          {lesson.id}
                        </span>
                        <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                          {lesson.order}. {lesson.title}
                        </h3>
                        {done && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {lesson.sciencePrinciple} · {lesson.researcherCitation}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {progress?.bestScore !== undefined && (
                        <span className="text-xs font-mono tabular-nums text-emerald-700 font-semibold">
                          Best {progress.bestScore}%
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => onStartLesson(lesson)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:text-emerald-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Play className="w-3.5 h-3.5" />
                        {done ? 'Review' : 'Practice'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {filteredLevels.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-600">
            No lessons match "{searchQuery}". Try another psychological term or clear the filter.
          </div>
        )}
      </div>
    </div>
  );
}
