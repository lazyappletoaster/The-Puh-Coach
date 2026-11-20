import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CoachAuthProvider, useCoachAuth } from './context/CoachAuthContext';
import { TopNav, type NavTab } from './components/TopNav';
import { LandingPage } from './components/LandingPage';
import { LearningPathView } from './components/LearningPathView';
import { VoiceLabView } from './components/VoiceLabView';
import { CurriculumIndexView } from './components/CurriculumIndexView';
import { HistoryView } from './components/HistoryView';
import { LessonPlayer } from './components/LessonPlayer';
import { ALL_LESSONS, getLevelById } from './data/curriculum';
import type { Lesson } from './types/curriculum';

function PuhCoachApp() {
  const { user, authReady } = useCoachAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('path');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    if (!user) {
      setActiveLesson(null);
      setActiveTab('path');
    }
  }, [user]);

  const handleOpenNextLesson = () => {
    if (!activeLesson) return;
    const idx = ALL_LESSONS.findIndex((l) => l.id === activeLesson.id);
    if (idx >= 0 && idx + 1 < ALL_LESSONS.length) {
      setActiveLesson(ALL_LESSONS[idx + 1]);
    } else {
      setActiveLesson(null);
    }
  };

  const activeLevelTitle = activeLesson
    ? getLevelById(activeLesson.levelId)?.title || `Level ${activeLesson.levelId}`
    : '';

  const hasNextLesson = activeLesson
    ? ALL_LESSONS.findIndex((l) => l.id === activeLesson.id) < ALL_LESSONS.length - 1
    : false;

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBF9] text-slate-600">
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Loading The Puh Coach...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBF9] text-slate-900">
      <TopNav activeTab={activeTab} onSelectTab={setActiveTab} />

      <div className="flex-1">
        {!user ? (
          <LandingPage />
        ) : (
          <>
            {activeTab === 'path' && (
              <LearningPathView
                onStartLesson={(lesson) => setActiveLesson(lesson)}
                onOpenVoiceLab={() => setActiveTab('lab')}
              />
            )}
            {activeTab === 'lab' && <VoiceLabView />}
            {activeTab === 'curriculum' && (
              <CurriculumIndexView onStartLesson={(lesson) => setActiveLesson(lesson)} />
            )}
            {activeTab === 'history' && <HistoryView />}
          </>
        )}
      </div>

      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>The Puh Coach · Street-Smart Communication Training</span>
          <span>10 Levels · 250 Lessons grounded in real psychology &amp; voice timing</span>
        </div>
      </footer>

      {user && activeLesson && (
        <LessonPlayer
          key={activeLesson.id}
          lesson={activeLesson}
          levelTitle={activeLevelTitle}
          onClose={() => setActiveLesson(null)}
          onNextLesson={hasNextLesson ? handleOpenNextLesson : undefined}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <CoachAuthProvider>
        <PuhCoachApp />
      </CoachAuthProvider>
    </ErrorBoundary>
  );
}
