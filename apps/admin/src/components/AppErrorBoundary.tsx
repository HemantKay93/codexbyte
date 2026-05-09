import React from 'react';

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Admin app render error:', error, errorInfo);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="w-full max-w-lg rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-white/70">
            The admin panel hit a runtime error. Reload the page after checking the console or
            server logs.
          </p>
          {import.meta.env.DEV && (
            <pre className="mt-4 max-h-48 overflow-auto rounded bg-black/40 p-3 text-xs text-red-100">
              {this.state.error.message}
            </pre>
          )}
          <button
            className="mt-5 rounded bg-white px-4 py-2 text-sm font-semibold text-slate-950"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
