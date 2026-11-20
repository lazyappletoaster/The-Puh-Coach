import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAFBF9] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Something interrupted your session
            </h1>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              We hit an unexpected issue while syncing your coaching data. Reloading restores a clean workspace.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-xs font-mono text-slate-700 break-words">
              {this.state.message}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="duo-btn-emerald bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm cursor-pointer"
            >
              Reload The Puh Coach
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
