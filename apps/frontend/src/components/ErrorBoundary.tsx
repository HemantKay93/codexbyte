import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#04080F] text-white px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
          <p className="text-gray-400 mb-6 max-w-md text-sm">
            An unexpected error occurred. Please try refreshing the page. If this persists, contact
            support.
          </p>
          {this.state.error && (
            <details className="mb-6 text-left max-w-md w-full">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">
                Technical details
              </summary>
              <pre className="mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded p-3 overflow-auto max-h-40">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <div className="flex gap-4">
            <button
              onClick={this.handleReset}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              className="px-6 py-2 border border-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
