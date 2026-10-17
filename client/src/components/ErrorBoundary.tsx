import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-red-200 shadow-xl max-w-xl mx-auto my-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-sm">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black font-display text-slate-900">
              {this.props.fallbackTitle || 'Display Error Encountered'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {this.state.error?.message || 'An unexpected error occurred while rendering this interface.'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-md shadow-red-600/20 inline-flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Interface</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
