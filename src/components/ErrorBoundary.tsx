import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong. Please try again later.";
      let isFirestoreError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error) {
            errorMessage = parsed.error;
            isFirestoreError = true;
          }
        }
      } catch (e) {
        // Not a JSON error message
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6">
          <div className="glass p-12 rounded-[3rem] max-w-2xl w-full text-center border border-white/10 shadow-glow/10">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <AlertTriangle className="text-red-500" size={40} />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-6">
              {isFirestoreError ? "Database Connection Issue" : "Application Error"}
            </h1>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
              <p className="text-gray-400 text-sm font-mono break-words leading-relaxed">
                {errorMessage}
              </p>
            </div>

            {isFirestoreError && (
              <p className="text-gray-400 mb-8 text-sm">
                This usually happens due to temporary network issues or firewall restrictions. 
                Our system is attempting to reconnect using more compatible protocols.
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-brand rounded-2xl font-bold hover:shadow-glow transition-all"
              >
                <RefreshCw size={20} />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all"
              >
                <Home size={20} />
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
