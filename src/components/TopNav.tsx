import React from 'react';
import { LogOut } from 'lucide-react';
import { useCoachAuth } from '../context/CoachAuthContext';

export type NavTab = 'path' | 'lab' | 'curriculum' | 'history';

interface TopNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export function TopNav({ activeTab, onSelectTab }: TopNavProps) {
  const { user, isSigningIn, signInWithGoogle, signOutUser } = useCoachAuth();

  const workspaceNavItems: { id: NavTab; label: string }[] = [
    { id: 'path', label: 'Learning Path' },
    { id: 'lab', label: 'Voice Lab' },
    { id: 'curriculum', label: 'All 250 Lessons' },
    { id: 'history', label: 'Practice Log' },
  ];

  const landingNavItems: { href: string; label: string }[] = [
    { href: '#about', label: 'About' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#curriculum-overview', label: '10 Levels' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#FAFBF9]/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => {
            if (user) {
              onSelectTab('path');
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded"
        >
          The Puh Coach
        </button>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        {user ? (
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {workspaceNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                    isActive
                      ? 'border-emerald-600 text-slate-900 font-semibold'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {landingNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="py-1.5 border-b-2 border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors whitespace-nowrap shrink-0"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <button
              type="button"
              onClick={signOutUser}
              title="Sign out of Google account"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <span className="max-w-[130px] truncate">
                {user.displayName || 'Signed In'}
              </span>
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
            </button>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={isSigningIn}
              className="duo-btn-emerald bg-emerald-600 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
            >
              {isSigningIn ? 'Signing in...' : 'Sign Up with Google'}
            </button>
          )}
        </div>
      </div>

      {/* Compact Mobile Navigation Row */}
      {user ? (
        <nav className="md:hidden border-t border-slate-200 bg-white px-4 py-1.5 flex items-center justify-between gap-2 overflow-x-auto">
          {workspaceNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`px-2 py-1 text-xs font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-600'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      ) : (
        <nav className="md:hidden border-t border-slate-200 bg-white px-4 py-1.5 flex items-center justify-center gap-6 overflow-x-auto">
          {landingNavItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
